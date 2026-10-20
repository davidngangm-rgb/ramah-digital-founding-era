"use client";
import {useState} from 'react';

export function CopyReferralButton({path}:{path:string}){
  const [state,setState]=useState<'idle'|'copying'|'copied'|'error'>('idle');
  async function copy(){
    if(state==='copying')return;
    setState('copying');
    try{
      const value=new URL(path,window.location.origin).toString();
      await navigator.clipboard.writeText(value);
      setState('copied');
    }catch{
      setState('error');
    }
    window.setTimeout(()=>setState('idle'),2200);
  }
  return <button type="button" onClick={copy} disabled={state==='copying'} aria-live="polite" aria-busy={state==='copying'}>{state==='copying'?'Copying…':state==='copied'?'Copied':state==='error'?'Copy failed':'Copy link'}</button>;
}
