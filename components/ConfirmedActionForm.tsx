"use client";

import type {ReactNode,FormEvent} from 'react';

export function ConfirmedActionForm({action,children,className,confirmation}:{action:(formData:FormData)=>void|Promise<void>;children:ReactNode;className?:string;confirmation:string}){
  function confirm(event:FormEvent<HTMLFormElement>){if(!window.confirm(confirmation))event.preventDefault()}
  return <form action={action} className={className} onSubmit={confirm}>{children}</form>;
}
