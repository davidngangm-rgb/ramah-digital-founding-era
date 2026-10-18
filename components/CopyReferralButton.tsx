"use client";
import {useState} from 'react';

export function CopyReferralButton({path}:{path:string}){const [copied,setCopied]=useState(false);async function copy(){const value=new URL(path,window.location.origin).toString();await navigator.clipboard.writeText(value);setCopied(true);window.setTimeout(()=>setCopied(false),2000)}return <button type="button" onClick={copy} aria-live="polite">{copied?'Copied':'Copy link'}</button>}
