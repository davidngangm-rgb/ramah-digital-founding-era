"use client";

import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';
import {captureUploadSubmission} from '@/lib/upload-submission';
import {validateUpload,validateUploadContent} from '@/lib/upload-policy';
import {trackRamahEvent,type ApplicantCategory} from '@/lib/analytics';
import {ActionSubmitButton} from '@/components/ActionSubmitButton';

type SaveResult={ok:true;href:string}|{ok:false;error:string};
type ServerAction=(formData:FormData)=>Promise<SaveResult>;
type InitialMedia={url:string;kind:'image'|'video'|'document';label:string};
type Preview=InitialMedia&{key:string};
type UploadRecord={path:string;reference?:string};

class StorageUploadError extends Error{
  constructor(message:string,readonly status:number){super(message)}
}

function extension(file:File){
  const fromName=file.name.split('.').pop()?.replace(/[^a-z0-9]/gi,'').toLowerCase();
  if(fromName)return fromName==='jpeg'?'jpg':fromName;
  if(file.type==='image/jpeg')return 'jpg';
  if(file.type==='image/png')return 'png';
  if(file.type==='image/webp')return 'webp';
  if(file.type==='video/mp4')return 'mp4';
  return 'bin';
}

function safeFileName(name:string){return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(-100)||'document'}

async function uploadDirect(file:File,bucket:string,path:string,isPrivate:boolean,onProgress:(value:number)=>void){
  const sb=createClient();
  const {data:{session}}=await sb.auth.getSession();
  if(!session)throw new Error('Your session expired. Sign in and retry the upload.');
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const apiKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  try{await new Promise<void>((resolve,reject)=>{
    const xhr=new XMLHttpRequest();
    xhr.open('POST',`${base}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`);
    xhr.setRequestHeader('Authorization',`Bearer ${session.access_token}`);
    xhr.setRequestHeader('apikey',apiKey);
    xhr.setRequestHeader('Content-Type',file.type||'application/octet-stream');
    xhr.setRequestHeader('x-upsert','false');
    xhr.upload.onprogress=event=>{if(event.lengthComputable)onProgress(Math.round((event.loaded/event.total)*100))};
    xhr.onerror=()=>reject(new Error('The upload was interrupted. Check your connection and retry.'));
    xhr.onabort=()=>reject(new Error('The upload was interrupted. Retry when ready.'));
    xhr.onload=()=>{
      if(xhr.status>=200&&xhr.status<300){resolve();return}
      const message=xhr.status===401?'Your session expired. Sign in again, then retry.':xhr.status===403?'You do not have permission to upload this file.':xhr.status===413?'This file exceeds the storage size limit.':xhr.status===415?'This file format is not allowed.':`Upload failed (${xhr.status}). Please retry.`;
      reject(new StorageUploadError(message,xhr.status));
    };
    xhr.send(file);
  });}catch(error){
    if(!(error instanceof StorageUploadError)||error.status!==409)throw error;
    // A previous attempt can finish on Storage even if the browser loses its
    // response. Reuse only the exact owned object at this attempt's path.
    const {data, error:lookupError}=await sb.storage.from(bucket).info(path);
    if(lookupError||data?.size!==file.size)throw error;
  }
  onProgress(100);
  return isPrivate?path:sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function DirectUploadForm({action,className,children,initialMedia=[]}:{action:ServerAction;className?:string;children:React.ReactNode;initialMedia?:InitialMedia[]}){
  const router=useRouter();
  const formRef=useRef<HTMLFormElement>(null);
  const objectUrls=useRef<string[]>([]);
  const uploadedFiles=useRef<WeakMap<File,Map<string,UploadRecord>>>(new WeakMap());
  const submitting=useRef(false);
  const [previews,setPreviews]=useState<Preview[]>([]);
  const [progress,setProgress]=useState<Record<string,number>>({});
  const [busy,setBusy]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>()=>objectUrls.current.forEach(URL.revokeObjectURL),[]);

  function previewSelection(){
    objectUrls.current.forEach(URL.revokeObjectURL);
    objectUrls.current=[];
    const next:Preview[]=[];
    formRef.current?.querySelectorAll<HTMLInputElement>('input[type="file"][data-upload-bucket]').forEach(input=>{
      Array.from(input.files??[]).forEach((file,index)=>{
        const url=URL.createObjectURL(file);objectUrls.current.push(url);
        next.push({key:`${input.dataset.uploadOutput}-${index}-${file.name}`,url,kind:file.type.startsWith('video/')?'video':file.type.startsWith('image/')?'image':'document',label:file.name});
      });
    });
    setPreviews(next);setError(null);
  }

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(submitting.current)return;
    const form=event.currentTarget;
    if(!(form instanceof HTMLFormElement)){setError('The form is unavailable. Please retry.');return;}
    // React does not keep currentTarget populated across an await. Snapshot
    // both the form fields and the actual File objects synchronously.
    const {metadata,selections}=captureUploadSubmission(form);
    submitting.current=true;
    setBusy(true);setError(null);setProgress({});
    try{
      const sb=createClient();
      const {data:{user}}=await sb.auth.getUser();
      if(!user)throw new Error('Your session expired. Sign in and retry.');
      for(const input of selections){
        const {bucket,output,files,isPrivate}=input;
        if(!bucket||!output)continue;
        for(let index=0;index<files.length;index++){
          const file=files[index],key=`${output}-${index}`;
          validateUpload(file,bucket);
          await validateUploadContent(file);
          let records=uploadedFiles.current.get(file);
          if(!records){records=new Map();uploadedFiles.current.set(file,records)}
          const cacheKey=`${user.id}:${bucket}:${output}:${isPrivate}`;
          let upload=records.get(cacheKey);
          if(!upload){upload={path:isPrivate?`${user.id}/${output}/${crypto.randomUUID()}-${safeFileName(file.name)}`:`${user.id}/founding-${crypto.randomUUID()}.${extension(file)}`};records.set(cacheKey,upload)}
          const reference=upload.reference??await uploadDirect(file,bucket,upload.path,isPrivate,value=>setProgress(current=>({...current,[key]:value})));
          upload.reference=reference;
          metadata.append(output,reference);
        }
      }
      setSaving(true);
      const result=await action(metadata);
      if(!result?.ok)throw new Error(result?.error||'The application could not be saved. Please retry.');
      if(window.location.pathname.startsWith('/portal/onboarding')){
        const has=(name:string)=>Boolean(form.elements.namedItem(name));
        const step=has('launchVideo')||has('showcaseVideo')?'launch-video':has('experienceName')?'experience':has('providerType')?'business':has('propertyName')?'property':has('roomName')?'rooms':has('fullName')?'profile':'review';
        const params=new URLSearchParams(window.location.search),vertical=params.get('vertical')||form.querySelector<HTMLInputElement>('[name="partnerVertical"]')?.value;
        const category:ApplicantCategory=window.location.pathname.includes('/experience')||vertical==='experience'?'experience_partner':form.querySelector<HTMLInputElement>('[name="propertyId"]')?'stay_partner':'traveler';
        trackRamahEvent('onboarding_step_completed',{applicant_category:category,onboarding_step:step});
      }
      router.push(result.href);
    }catch(caught){
      setError(caught instanceof Error?caught.message:'Upload failed. Please retry.');
    }finally{
      submitting.current=false;
      setBusy(false);
      setSaving(false);
    }
  }

  const media=[...initialMedia.map((item,index)=>({...item,key:`initial-${index}`})),...previews];
  return <form ref={formRef} onSubmit={submit} onChange={previewSelection} className={className}>
    {children}
    {(media.length>0||Object.keys(progress).length>0||error)&&<div className="upload-feedback" aria-live="polite">
      {media.length>0&&<div className="upload-previews">{media.map(item=><figure key={item.key}>{item.kind==='video'?<video src={item.url} controls preload="metadata"/>:item.kind==='image'?<Image src={item.url} alt="" width={320} height={240} unoptimized/>:<a href={item.url} target="_blank" rel="noreferrer">Open document</a>}<figcaption>{item.label}</figcaption></figure>)}</div>}
      {Object.entries(progress).map(([key,value])=><div className="upload-progress" key={key}><span><b>Uploading media</b><small>{value}%</small></span><progress max="100" value={value}>{value}%</progress></div>)}
      {error&&<p className="form-error" role="alert">{error} Your selections are preserved—use the button to retry.</p>}
    </div>}
    <ActionSubmitButton className="button dark wide" type="submit" isLoading={busy} loadingText={saving?'Saving your application…':'Uploading securely…'}>{error?'Retry upload and save':'Save and continue'}</ActionSubmitButton>
  </form>;
}
