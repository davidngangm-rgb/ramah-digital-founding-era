import type {Metadata} from 'next';
import Link from 'next/link';
import {AuthForm} from '@/components/AuthForm';
import {parseMembershipSelection,publicTierCodes,tiersFor,type MembershipKind} from '@/lib/memberships';
import {presentedTier,tiersForPath,type FoundingPath} from '@/lib/foundingPresentation';

export const metadata:Metadata={title:'Create your Ramah account',robots:{index:false,follow:false}};

export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,creatorIntent=q.intent==='creator'||q.path==='creator';
  const selection=creatorIntent?null:parseMembershipSelection(q.type,q.tier),requestedKind=q.type==='host'||q.type==='traveler'?q.type:null;
  const type:MembershipKind=selection?.kind??requestedKind??'traveler';
  const vertical:'stay'|'experience'=q.vertical==='experience'?'experience':'stay';
  const path:FoundingPath=creatorIntent?'creator':type==='traveler'?'traveler':vertical;
  const selectedPresentation=presentedTier(path,creatorIntent?q.tier:selection?.tierCode);
  const signInNext=creatorIntent?`/creators/apply?tier=${q.tier??''}&creatorTier=${q.tier??''}${q.ref?`&ref=${q.ref}`:''}`:`${type==='host'&&vertical==='experience'?'/portal/onboarding/experience':'/portal/onboarding'}?type=${type}&tier=${selection?.publicTier??''}${type==='host'?`&vertical=${vertical}`:''}${q.ref?`&ref=${q.ref}`:''}`;

  return <main id="main" className="auth-page">
    <Link className="brand auth-brand" href="/"><span>R</span><b>RAMAH</b></Link>
    <section>
      <aside className="auth-context"><span className="eyebrow">Founding Era · Account</span><h1>{creatorIntent?'Create your account, then apply.':'Create your Ramah account.'}</h1><p>{creatorIntent?'Creator recruitment is free. Founder approval does not charge you or activate paid capabilities. This account can still hold Traveler or Partner roles later.':'Creating an account does not reserve or assign a Founder Number. Complete onboarding and submit for Founder review.'}</p><div className="type-toggle"><Link className={!creatorIntent&&type==='traveler'?'active':''} href="/founding-era/travelers">Traveler</Link><Link className={!creatorIntent&&type==='host'&&vertical==='stay'?'active':''} href="/founding-era/partners?vertical=stay">Stay Partner</Link><Link className={!creatorIntent&&type==='host'&&vertical==='experience'?'active':''} href="/founding-era/partners?vertical=experience">Experience Partner</Link><Link className={creatorIntent?'active':''} href="/founding-era/creators">Creator</Link></div>
        {selectedPresentation&&<div className="auth-privileges" aria-label="Selected membership privileges"><span>Selected membership</span><h2>{selectedPresentation.name}</h2><strong>{selectedPresentation.price===0?'Free':`US$${selectedPresentation.price}`} <small>{selectedPresentation.paymentTiming}</small></strong><p>{selectedPresentation.summary}</p><ul>{selectedPresentation.benefits.slice(0,5).map(benefit=><li key={benefit}>{benefit}</li>)}</ul><div>{selectedPresentation.conditions.map(condition=><small key={condition}>{condition}</small>)}</div></div>}
      </aside>
      <div className="auth-workflow">
        {creatorIntent?<div className="selected-membership" role="status"><span>Creator application</span><strong>Free to apply</strong><small>Your intended Plus or Pro tier is recorded before review</small></div>:selection?<div className="selected-membership" role="status"><span>Selected membership</span><strong>{selectedPresentation?.name??selection.tier.name}</strong><small>{selection.kind==='host'?(vertical==='experience'?'Experience Partner':'Stay Partner'):'Traveler'} · {selection.tier.price===0?'Free':`US$${selection.tier.price} one-time`}</small><a href="#membership-choice">Change membership</a></div>:<p className="selection-required" role="alert">Choose a valid membership before creating your account. Query selections are validated and never activate pricing, privileges or Founder status.</p>}
        {!creatorIntent&&<div id="membership-choice" className="signup-tier-choice" aria-label={`Choose a ${type} membership`}>{tiersFor(type).map(tier=>{const publicTier=Object.entries(publicTierCodes[type]).find(([,code])=>code===tier.code)?.[0];const label=tiersForPath(path).find(item=>item.code===tier.code)?.name??tier.name;return <Link className={selection?.tierCode===tier.code?'active':''} key={tier.code} href={`/auth/sign-up?type=${type}&tier=${publicTier}${type==='host'?`&vertical=${vertical}`:''}`}><b>{label}</b><span>{tier.price===0?'FREE':`US$${tier.price}`}</span></Link>})}</div>}
        {creatorIntent?<AuthForm mode="up" type="creator" tier={q.tier} referral={q.ref} error={q.error} next="/creators/apply"/>:selection&&<AuthForm mode="up" type={type} tier={selection.publicTier} vertical={vertical} referral={q.ref} error={q.error}/>}<p className="auth-switch">Already have an account? <Link href={`/auth/sign-in?next=${encodeURIComponent(signInNext)}`}>Sign in</Link></p>
      </div>
    </section>
  </main>;
}
