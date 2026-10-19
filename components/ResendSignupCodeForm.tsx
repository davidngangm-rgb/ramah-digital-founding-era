"use client";

import {useEffect,useState} from 'react';
import {resendSignupCode} from '@/app/auth/actions';

const COOLDOWN_SECONDS=60;

export function ResendSignupCodeForm({email,next,resent}:{email:string;next:string;resent:boolean}){
  const [remaining,setRemaining]=useState(resent?COOLDOWN_SECONDS:0);
  useEffect(()=>{
    const key=`ramah-signup-code-resend:${email.trim().toLowerCase()}`;
    if(resent){const until=Date.now()+COOLDOWN_SECONDS*1000;window.localStorage.setItem(key,String(until))}
    const refresh=()=>{const until=Number(window.localStorage.getItem(key)??0);setRemaining(Math.max(0,Math.ceil((until-Date.now())/1000)))};
    const initial=window.setTimeout(refresh,0),timer=window.setInterval(refresh,1000);return()=>{window.clearTimeout(initial);window.clearInterval(timer)};
  },[email,resent]);
  return <form action={resendSignupCode} className="auth-form" onSubmit={()=>{const key=`ramah-signup-code-resend:${email.trim().toLowerCase()}`;window.localStorage.setItem(key,String(Date.now()+COOLDOWN_SECONDS*1000));setRemaining(COOLDOWN_SECONDS)}}>
    <input type="hidden" name="email" value={email}/><input type="hidden" name="next" value={next}/>
    {resent&&<p className="notice" role="status">A new code was requested. If you do not receive it, check the address and try again after the cooldown.</p>}
    <button className="button" type="submit" disabled={!email||remaining>0}>{remaining>0?`Send a new code in ${remaining}s`:'Send a new code'}</button>
  </form>;
}
