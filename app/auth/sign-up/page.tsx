import type {Metadata} from 'next';
import Link from 'next/link';
import {AuthForm} from '@/components/AuthForm';

export const metadata:Metadata={title:'Create your Ramah account',robots:{index:false,follow:false}};

export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,type=q.type==='host'?'host':'traveler';
  return <main id="main" className="auth-page">
    <Link className="brand auth-brand" href="/"><span>R</span><b>RAMAH</b></Link>
    <section>
      <div>
        <span className="eyebrow">Step 1 of 4 · Account</span>
        <h1>Begin as a Founding {type==='host'?'Host':'Traveler'}.</h1>
        <p>This account is also your Ramah App account. No duplicate identity will be created.</p>
        <div className="type-toggle"><Link className={type==='traveler'?'active':''} href="/auth/sign-up?type=traveler">Traveler</Link><Link className={type==='host'?'active':''} href="/auth/sign-up?type=host">Host</Link></div>
      </div>
      <AuthForm mode="up" type={type} error={q.error}/>
      <p className="auth-switch">Already have an account? <Link href="/auth/sign-in">Sign in</Link></p>
    </section>
  </main>;
}
