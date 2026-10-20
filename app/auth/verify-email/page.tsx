import type {Metadata} from 'next';
import Link from 'next/link';
import {verifySignupCode} from '@/app/auth/actions';
import {ResendSignupCodeForm} from '@/components/ResendSignupCodeForm';
import {AuthBrand} from '@/components/AuthBrand';
import {OtpCodeInput} from '@/components/OtpCodeInput';
import {ActionSubmitButton} from '@/components/ActionSubmitButton';
export const metadata:Metadata={title:'Verify email',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,email=q.email??'',next=q.next??'/portal';
  return <main id="main" className="auth-page auth-page--verification">
    <AuthBrand />
    <section className="auth-page__panel auth-page__panel--verification">
      <div className="auth-context auth-verification-copy"><span className="eyebrow">Account verification</span><h1>Verify your email.</h1><p>Enter the six-digit code sent to <strong className="auth-email">{email||'your email address'}</strong>. The same verified account works in the Ramah app and Founding Era website.</p><p>If your email includes a secure confirmation link, opening it will also verify your account and continue.</p></div>
      <div className="auth-workflow auth-verification-workflow">
        <form action={verifySignupCode} className="auth-form">
          <input type="hidden" name="email" value={email}/><input type="hidden" name="next" value={next}/>
          <label htmlFor="signup-code">Six-digit verification code</label>
          <OtpCodeInput id="signup-code" describedBy={q.error?'verification-error':'verification-hint'}/>
          <small id="verification-hint" className="auth-helper">Paste the code from your email or enter each digit.</small>
          {q.error&&<p id="verification-error" className="form-error" role="alert">{q.error}</p>}
          <ActionSubmitButton loadingText="Verifying…">Verify and continue</ActionSubmitButton>
        </form>
        <ResendSignupCodeForm email={email} next={next} resent={q.resent==='1'} cooldown={q.cooldown==='1'}/>
        <p className="auth-switch">Already verified or already have an account? <Link href={`/auth/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link></p>
      </div>
    </section>
  </main>;
}
