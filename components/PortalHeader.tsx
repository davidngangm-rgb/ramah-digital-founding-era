import Image from 'next/image';import Link from 'next/link';
import {signOut} from '@/app/auth/actions';

export function PortalHeader({admin=false,displayName}:{admin?:boolean;displayName?:string}){
  const portalLinks=admin?<><Link href="/founding-admin#overview">Overview</Link><Link href="/founding-admin#applications">Applications</Link><Link href="/founding-admin/launch">Launch readiness</Link><Link href="/founding-admin/testing">Testing access</Link><Link href="/founding-admin#founder-hall">Founder Hall</Link><a href={process.env.NEXT_PUBLIC_OPERATIONS_URL??'#'}>Main Operations ↗</a></>:<><Link href="/portal">Headquarters</Link><Link href="/portal/onboarding">Launch profile</Link><Link href="/portal/certificate">Certificate</Link><Link href="/founders">Founder Hall</Link></>;
  return <header className={`portal-header ${admin?'admin':''}`}>
    <Link className="brand" href={admin?'/founding-admin':'/portal'}><Image src="/ramah-app-icon.png" width={40} height={40} alt=""/><b>{admin?'FOUNDING OPERATIONS':'FOUNDER PORTAL'}</b></Link>
    <nav>{portalLinks}</nav><details className="mobile-menu portal-mobile-menu"><summary aria-label="Open portal navigation"><span/><span/><span/></summary><div>{portalLinks}</div></details>
    {displayName&&<span className="admin-identity">{displayName}</span>}<form action={signOut}><button className="text-link">Sign out</button></form>
  </header>;
}
