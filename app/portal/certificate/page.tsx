import {notFound} from 'next/navigation';
import {CertificateActions} from '@/components/CertificateActions';
import {FounderCertificate} from '@/components/FounderCertificate';
import {createClient} from '@/lib/supabase/server';

export default async function Page(){
 const sb=await createClient();const {data:{user}}=await sb.auth.getUser();
 const [{data:portal},{data:profile}]=await Promise.all([sb.rpc('get_founder_portal'),user?sb.from('profiles').select('full_name,business_name').eq('id',user.id).maybeSingle():Promise.resolve({data:null})]);
 const identity=portal?.founderIdentity,credential=portal?.credential,membership=portal?.membership;
 if(!identity?.founderStatus||!identity?.founderNumber||credential?.verification_status!=='active')notFound();
 const name=profile?.full_name??profile?.business_name??user?.user_metadata?.full_name??'Ramah Founder';
 return <div className="certificate-page"><div className="certificate-page-heading"><span className="eyebrow">Your permanent Founder credential</span><h1>A record worthy of the wall.</h1><p>Issued by Ramah Digital and tied to your permanent Founder Identifier. Print it for your home, office, hotel lobby, or reception.</p></div><FounderCertificate name={name} founderNumber={identity.founderNumber} founderType={identity.founderType} tierCode={membership?.tierCode} credentialNumber={credential.credential_number} issuedAt={credential.issued_at}/><CertificateActions/></div>;
}
