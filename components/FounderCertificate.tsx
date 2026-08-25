import Image from 'next/image';import {tierName} from '@/lib/memberships';

export function FounderCertificate({name,founderNumber,founderType,tierCode,credentialNumber,issuedAt}:{name:string;founderNumber:string;founderType:string;tierCode?:string|null;credentialNumber?:string|null;issuedAt?:string|null}){
 const status=founderType==='host'?'Founding Host':'Founding Traveler';
 const date=issuedAt?new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(issuedAt)):'The Founding Era';
 return <section className="wall-certificate" aria-label={`Ramah Digital Founder Certificate for ${name}`}>
  <div className="certificate-frame"><div className="certificate-inner">
   <header><span className="certificate-emblem"><Image src="/ramah-app-icon.png" width={58} height={58} alt=""/></span><div><b>RAMAH DIGITAL</b><small>THE FOUNDING ERA · OFFICIAL RECORD</small></div></header>
   <div className="certificate-title"><span>Certificate of Founding Membership</span><h1>This certifies that</h1></div>
   <h2>{name}</h2>
   <p className="certificate-declaration">is permanently recognized by Ramah Digital as a <strong>{status}</strong>, among the first generation entrusted with shaping a more human future for travel and hospitality.</p>
   <div className="certificate-record"><div><small>FOUNDER IDENTIFIER</small><strong>{founderNumber}</strong></div><div><small>MEMBERSHIP</small><strong>{tierName(tierCode)}</strong></div><div><small>ISSUED</small><strong>{date}</strong></div></div>
   <footer className="certificate-signatures"><div><span className="script-signature">David Ngang Mabior</span><i/><b>David Ngang Mabior</b><small>CEO, Ramah Digital</small></div><div className="certificate-seal"><span><Image src="/ramah-app-icon.png" width={64} height={64} alt=""/></span><small>OFFICIALLY<br/>ISSUED</small></div><div><span className="credential-code">{credentialNumber??`RC-${founderNumber}`}</span><i/><b>Permanent Founder Record</b><small>Ramah Digital · Founding Era</small></div></footer>
  </div></div>
 </section>;
}
