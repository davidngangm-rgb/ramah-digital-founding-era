"use client";

import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {createClient} from '@/lib/supabase/browser';

type ServerAction=(formData:FormData)=>Promise<void>;
type InitialMedia={url:string;kind:'image'|'video';label:string};
type Preview=InitialMedia&{key:string};

function extension(file:File){
  const fromName=file.name.split('.').pop()?.replace(/[^a-z0-9]/gi,'').toLowerCase();
  if(fromName)return fromName==='jpeg'?'jpg':fromName;
  if(file.type==='image/jpeg')return 'jpg';
  if(file.type==='image/png')return 'png';
  if(file.type==='image/webp')return 'webp';
  if(file.type==='video/mp4')return 'mp4';
  return 'bin';
}

async function uploadDirect(file:File,bucket:string,userId:string,onProgress:(value:number)=>void){
  const sb=createClient();
  const {data:{session}}=await sb.auth.getSession();
  if(!session)throw new Error('Your session expired. Sign in and retry the upload.');
  const path=`${userId}/founding-${crypto.randomUUID()}.${extension(file)}`;
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const apiKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  await new Promise<void>((resolve,reject)=>{
    const xhr=new XMLHttpRequest();
    xhr.open('POST',`${base}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`);
    xhr.setRequestHeader('Authorization',`Bearer ${session.access_token}`);
    xhr.setRequestHeader('apikey',apiKey);
    xhr.setRequestHeader('Content-Type',file.type||'application/octet-stream');
    xhr.setRequestHeader('x-upsert','false');
    xhr.upload.onprogress=event=>{if(event.lengthComputable)onProgress(Math.round((event.loaded/event.total)*100))};
    xhr.onerror=()=>reject(new Error('The upload was interrupted. Check your connection and retry.'));
    xhr.onabort=()=>reject(new Error('The upload was interrupted. Retry when ready.'));
    xhr.onload=()=>xhr.status>=200&&xhr.status<300?resolve():reject(new Error(`Upload failed (${xhr.status}). ${xhr.responseText||'Please retry.'}`));
    xhr.send(file);
  });
  onProgress(100);
  return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function DirectUploadForm({action,className,children,initialMedia=[]}:{action:ServerAction;className?:string;children:React.ReactNode;initialMedia?:InitialMedia[]}){
  const formRef=useRef<HTMLFormElement>(null);
  const objectUrls=useRef<string[]>([]);
  const [previews,setPreviews]=useState<Preview[]>([]);
  const [progress,setProgress]=useState<Record<string,number>>({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>()=>objectUrls.current.forEach(URL.revokeObjectURL),[]);

  function previewSelection(){
    objectUrls.current.forEach(URL.revokeObjectURL);
    objectUrls.current=[];
    const next:Preview[]=[];
    formRef.current?.querySelectorAll<HTMLInputElement>('input[type="file"][data-upload-bucket]').forEach(input=>{
      Array.from(input.files??[]).forEach((file,index)=>{
        const url=URL.createObjectURL(file);objectUrls.current.push(url);
        next.push({key:`${input.dataset.uploadOutput}-${index}-${file.name}`,url,kind:file.type.startsWith('video/')?'video':'image',label:file.name});
      });
    });
    setPreviews(next);setError(null);
  }

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    setBusy(true);setError(null);setProgress({});
    try{
      const sb=createClient();
      const {data:{user}}=await sb.auth.getUser();
      if(!user)throw new Error('Your session expired. Sign in and retry.');
      const metadata=new FormData(event.currentTarget);
      const inputs=Array.from(event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="file"][data-upload-bucket]'));
      for(const input of inputs){
        const bucket=input.dataset.uploadBucket,output=input.dataset.uploadOutput;
        if(!bucket||!output)continue;
        const files=Array.from(input.files??[]);
        for(let index=0;index<files.length;index++){
          const file=files[index],key=`${output}-${index}`;
          const url=await uploadDirect(file,bucket,user.id,value=>setProgress(current=>({...current,[key]:value})));
          metadata.append(output,url);
        }
      }
      await action(metadata);
    }catch(caught){
      setError(caught instanceof Error?caught.message:'Upload failed. Please retry.');
      setBusy(false);
    }
  }

  const media=[...initialMedia.map((item,index)=>({...item,key:`initial-${index}`})),...previews];
  return <form ref={formRef} onSubmit={submit} onChange={previewSelection} className={className}>
    {children}
    {(media.length>0||Object.keys(progress).length>0||error)&&<div className="upload-feedback" aria-live="polite">
      {media.length>0&&<div className="upload-previews">{media.map(item=><figure key={item.key}>{item.kind==='video'?<video src={item.url} controls preload="metadata"/>:<Image src={item.url} alt="" width={320} height={240} unoptimized/>}<figcaption>{item.label}</figcaption></figure>)}</div>}
      {Object.entries(progress).map(([key,value])=><div className="upload-progress" key={key}><span><b>Uploading media</b><small>{value}%</small></span><progress max="100" value={value}>{value}%</progress></div>)}
      {error&&<p className="form-error" role="alert">{error} Your selections are preserved—use the button to retry.</p>}
    </div>}
    <button className="button dark wide" type="submit" disabled={busy}>{busy?'Uploading securely…':error?'Retry upload and save':'Save and continue'}</button>
  </form>;
}
