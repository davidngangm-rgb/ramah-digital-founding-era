import type {Metadata} from 'next';
import Link from 'next/link';
import {AuthForm} from '@/components/AuthForm';
import {parseMembershipSelection,publicTierCodes,tiersFor,type MembershipKind} from '@/lib/memberships';

export const metadata:Metadata={title:'Create your Ramah account',robots:{index:false,follow:false}};

export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,selection=parseMembershipSelection(q.type,q.tier),requestedKind=q.type==='host'||q.type==='traveler'?q.type:null;
  const type:MembershipKind=selection?.kind??requestedKind??'traveler';
  return <main id="main" className="auth-page">
    <Link className="brand auth-brand" href="/"><span>R</span><b>RAMAH</b></Link>
    <section>
      <div>
        <span className="eyebrow">Pre-registration · Account</span>
        <h1>Create your Ramah account.</h1>
        <p>The Global Founding Era opens on 30 August 2026. An account created before opening is a pre-registration and does not reserve or assign a Founder Number.</p>
        <div className="type-toggle"><Link className={type==='traveler'?'active':''} href="/auth/sign-up?type=traveler">Traveler</Link><Link className={type==='host'?'active':''} href="/auth/sign-up?type=host">Host</Link></div>
      </div>
      {selection?<div className="selected-membership" role="status"><span>Selected membership</span><strong>{selection.tier.name}</strong><small>{selection.kind==='host'?'Host':'Traveler'} · {selection.tier.price===0?'Free':`US$${selection.tier.price} one-time`}</small><a href="#membership-choice">Change membership</a></div>:<p className="selection-required" role="alert">Choose a valid membership before creating your account. Query selections are validated and never activate pricing, privileges or Founder status.</p>}
      <div id="membership-choice" className="signup-tier-choice" aria-label={`Choose a ${type} membership`}>{tiersFor(type).map(tier=>{const publicTier=Object.entries(publicTierCodes[type]).find(([,code])=>code===tier.code)?.[0];return <Link className={selection?.tierCode===tier.code?'active':''} key={tier.code} href={`/auth/sign-up?type=${type}&tier=${publicTier}`}><b>{tier.name}</b><span>{tier.price===0?'FREE':`US$${tier.price}`}</span></Link>})}</div>
      {selection&&<AuthForm mode="up" type={type} tier={selection.publicTier} error={q.error}/>}
      <p className="auth-switch">Already have an account? <Link href="/auth/sign-in">Sign in</Link></p>
    </section>
  </main>;
}
