"use client";

import {useState} from 'react';

export function OtpCodeInput({id='otp-code',name='token',describedBy}:{id?:string;name?:string;describedBy?:string}){
  const [code,setCode]=useState('');
  return <div className="otp-code" data-filled={code.length}>
    <div className="otp-code__slots" aria-hidden="true">
      {Array.from({length:6},(_,index)=><span className="otp-code__slot" data-current={index===Math.min(code.length,5)} key={index}>{code[index]??''}</span>)}
    </div>
    <input
      id={id}
      className="otp-code__input"
      type="text"
      name={name}
      value={code}
      required
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      aria-label="Six-digit verification code"
      aria-describedby={describedBy}
      onChange={event=>setCode(event.currentTarget.value.replace(/\D/g,'').slice(0,6))}
    />
  </div>;
}
