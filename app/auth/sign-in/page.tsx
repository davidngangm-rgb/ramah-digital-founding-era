import type {Metadata} from 'next';
import Link from 'next/link';
import {AuthForm} from '@/components/AuthForm';
import {AuthBrand} from '@/components/AuthBrand';

export const metadata:Metadata={title:'Sign in',robots:{index:false,follow:false}};

export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams;
  return <main id="main" className="auth-page">
    <AuthBrand />
    <section className="auth-page__panel">
      <div className="auth-context"><span className="eyebrow">Founder portal</span><h1>Return to your place in the story.</h1><p>Use the same email and password as the Ramah App.</p>{q.notice&&<p className="notice" role="status">{q.notice}</p>}</div>
      <div className="auth-workflow"><AuthForm mode="in" error={q.error} next={q.next}/><p className="auth-switch">New to Ramah? <Link href="/auth/sign-up">Create your account</Link></p></div>
    </section>
  </main>;
}
