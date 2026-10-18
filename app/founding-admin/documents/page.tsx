import {createClient} from '@/lib/supabase/server';

export default async function VerificationDocuments(){
  const sb=await createClient();
  const [{data:documents,error},{data:profiles}]=await Promise.all([
    sb.from('founding_verification_documents').select('id,owner_user_id,document_type,storage_path,original_name,mime_type,size_bytes,review_status,created_at').order('created_at',{ascending:false}).limit(200),
    sb.from('profiles').select('id,full_name,business_name,email'),
  ]);
  if(error)return <section className="executive-section"><p className="form-error" role="alert">{error.message}</p></section>;
  const paths=(documents??[]).map(document=>document.storage_path);
  const {data:signed}=paths.length?await sb.storage.from('founding-verification-documents').createSignedUrls(paths,600):{data:[]};
  const signedByPath=new Map((signed??[]).map(item=>[item.path,item.signedUrl]));
  const profileById=new Map((profiles??[]).map(profile=>[profile.id,profile]));
  return <section className="executive-section"><header className="executive-heading"><span>03</span><div><small>Private evidence</small><h1>Verification documents</h1></div><p>Ten-minute signed links are available only to authorized reviewers. Private object paths are never published.</p></header><div className="operations-list">{(documents??[]).map(document=>{const profile=profileById.get(document.owner_user_id),url=signedByPath.get(document.storage_path);return <article className="operation-card" key={document.id}><header><div><span className={`status-pill status-${document.review_status}`}>{document.review_status.replaceAll('_',' ')}</span><h3>{profile?.business_name??profile?.full_name??'Partner applicant'}</h3><p>{profile?.email??document.owner_user_id}</p></div></header><dl className="applicant-details"><div><dt>Document</dt><dd>{document.document_type.replaceAll('_',' ')}</dd></div><div><dt>File</dt><dd>{document.original_name}</dd></div><div><dt>Type</dt><dd>{document.mime_type}</dd></div><div><dt>Size</dt><dd>{Math.ceil(document.size_bytes/1024)} KB</dd></div></dl>{url?<a className="button dark" href={url} target="_blank" rel="noreferrer">Open private document</a>:<p className="form-error">A signed review link could not be created.</p>}</article>})}{!documents?.length&&<div className="executive-empty"><b>No verification documents submitted.</b><p>Partner evidence appears here after a secure upload is registered.</p></div>}</div></section>;
}
