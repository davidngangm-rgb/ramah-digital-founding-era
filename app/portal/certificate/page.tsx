import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';

export default async function CertificateStatusPage(){
  const sb=await createClient();
  const {data:{user}}=await sb.auth.getUser();
  if(!user)notFound();
  const {data}=await sb.rpc('get_founder_portal');
  if(!data?.founderIdentity?.founderStatus||!data?.founderIdentity?.founderNumber||data?.membership?.status!=='active')notFound();
  return <section className="certificate-page certificate-status-page">
    <div className="certificate-page-heading"><span className="eyebrow">Separate team-issued document</span><h1>Your membership is active.</h1><p>Your digital Founding Era membership is official and available in your Portal. The Founding Certificate is designed and issued separately by the Ramah Digital team; this page does not generate or represent a certificate.</p><p>For certificate issuance status, contact the Ramah Digital team and include your membership number <strong>{data.founderIdentity.founderNumber}</strong>.</p><Link className="button dark" href="/portal">Return to your Founding Era Portal</Link></div>
  </section>;
}
