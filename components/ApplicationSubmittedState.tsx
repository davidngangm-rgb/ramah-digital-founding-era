import {tierName} from '@/lib/memberships';

type Application={id:string;application_type:string;status:string;requested_tier_code:string|null;submitted_at:string;review_reason?:string|null};
type Stage={label:string;complete:boolean;detail?:string};

const statusLabel=(status:string)=>status.replaceAll('_',' ').replace(/\b\w/g,letter=>letter.toUpperCase());

export function ApplicationSubmittedState({displayName,category,application,identity,badges,certificateReady,paymentStatus,membershipActive,notice}:{displayName:string;category:string;application:Application;identity?:{founderNumber?:string|null}|null;badges?:unknown[];certificateReady:boolean;paymentStatus?:string;membershipActive:boolean;notice?:string}){
  const active=membershipActive,creator=application.application_type==='creator',community=application.requested_tier_code==='community_host',paymentNotRequired=creator||community;
  const financeVerified=paymentStatus==='verified';
  const stages:Stage[]=[
    {label:'Application received',complete:true,detail:new Date(application.submitted_at).toLocaleDateString('en',{dateStyle:'long'})},
    {label:'Founding Team review',complete:['under_review','approved','rejected'].includes(application.status),detail:statusLabel(application.status)},
    {label:paymentNotRequired?'Membership payment not required':'Finance payment verification',complete:paymentNotRequired||financeVerified,detail:paymentNotRequired?'Not required':paymentStatus?statusLabel(paymentStatus):'Awaiting Finance instructions'},
    {label:'Founder Admin decision',complete:['approved','rejected'].includes(application.status),detail:application.status==='approved'?'Approved':application.status==='rejected'?'Not approved':undefined},
    {label:'Membership activation',complete:active,detail:active?'Active':'Only after applicable checks and final approval'},
    {label:'Founder number and badge',complete:Boolean(identity?.founderNumber&&badges?.length),detail:identity?.founderNumber??undefined},
    {label:'Digital certificate',complete:certificateReady},
  ];
  const paymentMessage=creator
    ?'Creator recruitment is currently free. No payment is due, and paid Creator Plus or Pro activation remains deferred.'
    :community
      ?'Your selected Community Partner membership is free. No membership payment is required.'
      :financeVerified
        ?'Finance has recorded payment verification. Payment verification alone does not activate your membership; the Founding Team and Founder Admin review must still be completed.'
        :'If your selected membership requires payment, our Finance Team will contact you using your registered contact details with official instructions. Please wait for those instructions. Do not make any payment to an unverified account or individual.';
  return <div className="submitted-dashboard">
    <section className="submitted-hero"><div><span className="eyebrow light">Founding Era application</span><h1>Thank you for applying to the<br/><em>Ramah Digital Founding Era.</em></h1><p>Your application has been received and is awaiting review.</p><p>Our team will review your submitted information. {paymentMessage}</p><p>Your Founding Era membership, recognition and benefits will become active only after the applicable review, payment verification and final approval processes are completed.</p><p>You can return to this dashboard later to follow the latest status.</p>{notice&&<div className="notice" role="status">{notice}</div>}</div><aside><small>Application status</small><strong>{statusLabel(application.status)}</strong><span>{category}</span><b>{tierName(application.requested_tier_code)}</b><small>Reference</small><code>{application.id}</code><small>Submitted</small><time dateTime={application.submitted_at}>{new Date(application.submitted_at).toLocaleDateString('en',{dateStyle:'long'})}</time></aside></section>

    <section className="submitted-content"><article className="payment-instructions"><span className="eyebrow">What happens next</span><h2>{application.status==='under_review'?'Your application is being reviewed.':'Review comes first.'}</h2><p>The Ramah Digital Founding Team will review the information submitted with your application. If more information is needed, follow the instructions shown in this dashboard.</p><div><p>Next steps for your selected membership:</p><ul>{!paymentNotRequired&&<li>Finance contacts you with official payment instructions where applicable and records verification separately.</li>}<li>Founder Admin makes the final approval decision after required checks.</li><li>Only then are the approved tier, badge and eligible privileges activated on your Ramah account.</li></ul></div><strong className="payment-wait">Never send card or banking credentials through this website, and do not pay an unverified account or individual.</strong>{application.review_reason&&<p className="review-note"><b>Founding Team update:</b> {application.review_reason}</p>}</article>

      <article className="application-timeline"><header><span className="eyebrow">Your application</span><h2>Progress recorded<br/>from the real review status.</h2></header><ol>{stages.map((stage,index)=><li className={stage.complete?'complete':'pending'} key={stage.label}><span aria-hidden="true">{stage.complete?'✓':'○'}</span><div><small>{String(index+1).padStart(2,'0')}</small><b>{stage.label}</b>{stage.detail&&<em>{stage.detail}</em>}</div></li>)}</ol></article>
    </section>

    <section className="submitted-closing"><span className="eyebrow light">Your Ramah account</span><h2>Your application stays<br/>with you here.</h2><p>Your saved onboarding and submitted application remain connected to this account. Sign in again any time to check for a review update.</p><strong>Thank you for beginning this journey with us, {displayName.split(' ')[0]}.</strong></section>
  </div>;
}
