import Image from 'next/image';
import Link from 'next/link';
import {signOut} from '@/app/auth/actions';
import {ActionSubmitButton} from '@/components/ActionSubmitButton';

export function PortalHeader({admin=false,displayName}:{admin?:boolean;displayName?:string}){
  const operationsUrl=process.env.NEXT_PUBLIC_OPERATIONS_URL;
  const portalLinks=admin?<><Link href="/founding-admin#overview">Overview</Link><Link href="/founding-admin#applications">Applications</Link><Link href="/founding-admin/documents">Documents</Link><Link href="/founding-admin/launch">Launch readiness</Link><Link href="/founding-admin/testing">Testing access</Link><Link href="/founding-admin#founder-hall">Founder Hall</Link>{operationsUrl?<a href={operationsUrl}>Main Operations ↗</a>:<span className="portal-link-unavailable" aria-label="Main Operations is not configured">Main Operations</span>}</>:<><Link href="/portal">Dashboard</Link><Link href="/portal/apply">Application</Link><Link href="/contact">Help</Link></>;
  return <header className={`portal-header ${admin?'admin':''}`}><Link className="brand" href={admin?'/founding-admin':'/portal'}><Image src="/ramah-app-icon.png" width={40} height={40} alt=""/><b>{admin?'FOUNDING OPERATIONS':'FOUNDING ERA'}</b></Link><nav>{portalLinks}</nav><details className="mobile-menu portal-mobile-menu"><summary aria-label="Open portal navigation"><span/><span/><span/></summary><div>{portalLinks}</div></details>{displayName&&<span className="admin-identity">{displayName}</span>}<form action={signOut}><ActionSubmitButton className="text-link" loadingText="Signing out…">Sign out</ActionSubmitButton></form></header>;
}
