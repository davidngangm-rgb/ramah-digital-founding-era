import {tierName} from '@/lib/memberships';

type Stage={label:string;complete:boolean;detail?:string};

export function ApplicationSubmittedState({displayName,application,profileComplete,identity,badges,certificateReady,hallEligible,paymentStatus,notice}:{displayName:string;application:{application_type:string;status:string;requested_tier_code:string|null;submitted_at:string};profileComplete:boolean;identity?:{founderNumber?:string|null}|null;badges?:unknown[];certificateReady:boolean;hallEligible:boolean;paymentStatus?:string;notice?:string}){
  const reviewed=['approved','rejected'].includes(application.status),approved=application.status==='approved',founderAssigned=Boolean(identity?.founderNumber),creator=application.application_type==='creator',paymentNotRequired=creator||application.requested_tier_code==='community_host';
  const stages:Stage[]=[
    {label:'Account Created',complete:true},
    {label:'Profile Completed',complete:profileComplete},
    {label:'Founding Application Submitted',complete:true,detail:new Date(application.submitted_at).toLocaleDateString('en',{dateStyle:'long'})},
    {label:'Founding Team Review',complete:reviewed,detail:application.status.replaceAll('_',' ')},
    {label:paymentNotRequired?'Membership payment not required':'Finance verification',complete:paymentNotRequired||paymentStatus==='verified',detail:paymentNotRequired?'Not required':paymentStatus?.replaceAll('_',' ')},
    {label:'Founder Approval',complete:approved},
    {label:'Founder Number Assignment',complete:founderAssigned,detail:identity?.founderNumber??undefined},
    {label:'Founder Badge Issued',complete:Boolean(badges?.length)},
    {label:'Founder Certificate Issued',complete:certificateReady},
    {label:'Founder Hall Eligibility',complete:hallEligible},
  ];
  return <div className="submitted-dashboard">
    <section className="submitted-hero"><div><span className="eyebrow light">Status · Pending review</span><h1>Thank you for joining the<br/><em>Ramah Founding Era.</em></h1><p>Your application has been successfully submitted to the Ramah Digital Founding Team for review.</p><p>{creator?'Creator recruitment is currently free. Paid Creator membership activation remains deferred, and no payment has been requested.':paymentNotRequired?'Your selected membership does not require a membership payment. The Founding Team will complete the eligibility review before activation.':'Our Finance Team will contact you through your registered email address with the next steps, including payment instructions applicable to your selected membership.'}</p><p>You can follow your application status here in your Founding Era dashboard.</p><p>We appreciate your decision to be part of Ramah&apos;s beginning. Your journey with us starts here.</p>{notice&&<div className="notice" role="status">{notice}</div>}</div><aside><small>Application</small><strong>{application.application_type==='creator'?'Founding Creator':application.application_type==='host'?'Founding Partner':'Founding Traveler'}</strong><span>{tierName(application.requested_tier_code)}</span><i>Pending review</i></aside></section>

    <section className="submitted-content"><article className="payment-instructions"><span className="eyebrow">What happens next</span><h2>Founder review.</h2><p>The Ramah Digital Founding Team will review the information submitted with your application.</p><div><p>After the required checks:</p><ul>{!paymentNotRequired&&<li>Finance independently verifies the applicable external membership payment</li>}<li>The Founding Admin makes the final approval decision</li><li>Your approved membership is activated and its eligible privileges are assigned</li><li>Your Founder identity, badge and credential appear here when supported</li></ul></div><strong className="payment-wait">Do not send card or banking credentials through this website. Finance will contact you by registered email if payment applies.</strong></article>

      <article className="application-timeline"><header><span className="eyebrow">Your Founder journey</span><h2>Every step,<br/>truthfully recorded.</h2></header><ol>{stages.map((stage,index)=><li className={stage.complete?'complete':'pending'} key={stage.label}><span>{stage.complete?'✓':'○'}</span><div><small>{String(index+1).padStart(2,'0')}</small><b>{stage.label}</b>{stage.detail&&<em>{stage.detail}</em>}</div></li>)}</ol></article>
    </section>

    <section className="submitted-closing"><span className="eyebrow light">Before the world discovers it</span><h2>Thank you for believing<br/>in Ramah Digital.</h2><p>You are now standing at the door of something extraordinary.</p><p>Once your application is approved and activated, your permanent Founder identity—including your Founder Number, Founder Badge, credential, and Founding membership—will appear here.</p><strong>We are honored to have you begin this journey with us, {displayName.split(' ')[0]}.</strong></section>
  </div>;
}
