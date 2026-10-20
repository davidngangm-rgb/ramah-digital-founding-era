"use client";

import {useFormStatus} from 'react-dom';
import type {ButtonHTMLAttributes,ReactNode} from 'react';

type Props=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children'> & {
  children:ReactNode;
  loadingText:string;
  isLoading?:boolean;
};

export function ActionSubmitButton({children,loadingText,isLoading=false,disabled,className='button dark',type='submit',...props}:Props){
  const {pending,data}=useFormStatus();
  const busy=pending||isLoading;
  const selectedValue=props.name&&data?data.get(props.name):undefined;
  const showLoading=isLoading||(pending&&(!props.name||!data||selectedValue===String(props.value??'')));
  return <button {...props} type={type} className={`action-submit ${className}`} disabled={disabled||busy} aria-busy={busy||undefined}>
    <span className="action-submit__spinner" data-active={showLoading||undefined} aria-hidden="true"/>
    <span className="action-submit__label" aria-live="polite" aria-atomic="true">
      <span className="action-submit__label-default" aria-hidden={showLoading||undefined}>{children}</span>
      <span className="action-submit__label-loading" aria-hidden={!showLoading||undefined}>{loadingText}</span>
    </span>
  </button>;
}
