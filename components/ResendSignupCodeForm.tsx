"use client";

import {useEffect,useState} from 'react';
import {resendSignupCode} from '@/app/auth/actions';
import {ActionSubmitButton} from '@/components/ActionSubmitButton';

const COOLDOWN_SECONDS=60;

export function ResendSignupCodeForm({email,next,resent,cooldown=false}:{email:string;next:string;resent:boolean;cooldown?:boolean}){
  const [remaining,setRemaining]=useState(resent||cooldown?COOLDOWN_SECONDS:0);
  useEffect(()=>{
    const key=`ramah-signup-code-resend:${email.trim().toLowerCase()}`;
    if(resent||cooldown){const until=Date.now()+COOLDOWN_SECONDS*1000;window.localStorage.setItem(key,String(until))}
    const refresh=()=>{const until=Number(window.localStorage.getItem(key)??0);setRemaining(Math.max(0,Math.ceil((until-Date.now())/1000)))};
    const initial=window.setTimeout(refresh,0),timer=window.setInterval(refresh,1000);return()=>{window.clearTimeout(initial);window.clearInterval(timer)};
  },[email,resent,cooldown]);
  return <form action={resendSignupCode} className="auth-form auth-resend-form">
    <input type="hidden" name="email" value={email}/><input type="hidden" name="next" value={next}/>
    {resent&&<p className="notice" role="status">A new code was requested. If you do not receive it, check the address and try again after the cooldown.</p>}
    <ActionSubmitButton className="button auth-secondary-button" loadingText="Sending code…" disabled={!email||remaining>0}>{remaining>0?`Send a new code in ${remaining}s`:'Send a new code'}</ActionSubmitButton>
  </form>;
}
