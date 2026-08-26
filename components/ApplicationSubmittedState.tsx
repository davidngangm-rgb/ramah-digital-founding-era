import {tierName} from '@/lib/memberships';

type Stage={label:string;complete:boolean;detail?:string};

export function ApplicationSubmittedState({displayName,application,profileComplete,identity,badges,certificateReady,hallEligible,notice}:{displayName:string;application:{application_type:string;status:string;requested_tier_code:string|null;submitted_at:string};profileComplete:boolean;identity?:{founderNumber?:string|null}|null;badges?:unknown[];certificateReady:boolean;hallEligible:boolean;notice?:string}){
  const reviewed=['approved','rejected'].includes(application.status),approved=application.status==='approved',founderAssigned=Boolean(identity?.founderNumber);
  const stages:Stage[]=[
    {label:'Account Created',complete:true},
    {label:'Profile Completed',complete:profileComplete},
    {label:'Founding Application Submitted',complete:true,detail:new Date(application.submitted_at).toLocaleDateString('en',{dateStyle:'long'})},
    {label:'Verification Team Review',complete:reviewed,detail:application.status.replaceAll('_',' ')},
    {label:'Founder Approval',complete:approved},
    {label:'Founder Number Assignment',complete:founderAssigned,detail:identity?.founderNumber??undefined},
    {label:'Founder Badge Issued',complete:Boolean(badges?.length)},
    {label:'Founder Certificate Issued',complete:certificateReady},
    {label:'Founder Hall Eligibility',complete:hallEligible},
  ];
  return <div className="submitted-dashboard">
    <section className="submitted-hero"><div><span className="eyebrow light">Application received · {application.status.replaceAll('_',' ')}</span><h1>Welcome to the<br/><em>Ramah Digital Founding Era.</em></h1><p>Thank you for joining the beginning of Ramah Digital. Your Founding Era application has been received successfully and is now under review by our verification team.</p><p>This is the first step toward becoming one of Ramah Digital’s permanent Founding Members.</p>{notice&&<div className="notice" role="status">{notice}</div>}</div><aside><small>Application</small><strong>{application.application_type==='host'?'Founding Host':'Founding Traveler'}</strong><span>{tierName(application.requested_tier_code)}</span><i>Submitted</i></aside></section>

    <section className="submitted-content"><article className="payment-instructions"><span className="eyebrow">What happens next</span><h2>Founder review.</h2><p>The Ramah team will review the information submitted with your application.</p><div><p>After approval:</p><ul><li>Your membership is prepared for activation</li><li>Your permanent Founder Number is securely allocated and recorded by Ramah</li><li>Your Founder Badge and credential are issued</li><li>Your certificate becomes available in this portal</li></ul></div><strong className="payment-wait">You do not need to complete another step on this website while the review is in progress.</strong></article>

      <article className="application-timeline"><header><span className="eyebrow">Your Founder journey</span><h2>Every step,<br/>truthfully recorded.</h2></header><ol>{stages.map((stage,index)=><li className={stage.complete?'complete':'pending'} key={stage.label}><span>{stage.complete?'✓':'○'}</span><div><small>{String(index+1).padStart(2,'0')}</small><b>{stage.label}</b>{stage.detail&&<em>{stage.detail}</em>}</div></li>)}</ol></article>
    </section>

    <section className="submitted-closing"><span className="eyebrow light">Before the world discovers it</span><h2>Thank you for believing<br/>in Ramah Digital.</h2><p>You are now standing at the door of something extraordinary.</p><p>Once your application is approved and activated, your permanent Founder identity—including your Founder Number, Founder Badge, credential, and Founding membership—will appear here.</p><strong>We are honored to have you begin this journey with us, {displayName.split(' ')[0]}.</strong></section>
  </div>;
}
