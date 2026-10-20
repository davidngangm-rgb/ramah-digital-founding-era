import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';
import {tierName} from '@/lib/memberships';
import {AdminApplicationTable,type AdminApplicationRow} from '@/components/AdminApplicationTable';
import {reviewPublication} from './actions';
import {ActionSubmitButton} from '@/components/ActionSubmitButton';
import {ConfirmedActionForm} from '@/components/ConfirmedActionForm';

const label=(value?:string|null)=>value?.replaceAll('_',' ').replace(/\b\w/g,letter=>letter.toUpperCase())??'Not available';

export default async function FoundingAdminDashboard({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,sb=await createClient();
  const [campaignResult,allocationResult,applicationResult,approvedResult,rejectedResult,travelerResult,hostResult,experiencePartnerResult,stayPartnerResult,creatorResult,activeMembershipResult,documentResult,membershipResult,publicationResult]=await Promise.all([
    sb.from('founding_campaigns').select('id,name,status,traveler_capacity,host_capacity').order('created_at',{ascending:false}).limit(1),
    sb.from('founding_campaign_allocations').select('application_type,activated_count'),
    sb.from('founding_applications').select('id,campaign_id,application_type,status,requested_tier_code,submitted_at,reviewed_at,applicant_user_id,property_id,experience_id',{count:'exact'}).order('submitted_at',{ascending:false}).limit(100),
    sb.from('founding_applications').select('id',{count:'exact',head:true}).eq('status','approved'),
    sb.from('founding_applications').select('id',{count:'exact',head:true}).eq('status','rejected'),
    sb.from('founding_applications').select('id',{count:'exact',head:true}).eq('application_type','traveler'),
    sb.from('founding_applications').select('id',{count:'exact',head:true}).eq('application_type','host'),
    sb.from('founding_applications').select('id',{count:'exact',head:true}).eq('application_type','host').not('experience_id','is',null),
    sb.from('founding_applications').select('id',{count:'exact',head:true}).eq('application_type','host').is('experience_id',null),
    sb.from('founding_applications').select('id',{count:'exact',head:true}).eq('application_type','creator'),
    sb.from('circle_memberships').select('id',{count:'exact',head:true}).eq('membership_status','active'),
    sb.from('founding_verification_documents').select('id',{count:'exact',head:true}).eq('review_status','submitted'),
    sb.from('circle_memberships').select('id,user_id,circle_type,tier_code,membership_status,founder_status,founder_number,created_at').order('created_at',{ascending:false}).limit(100),
    sb.from('founder_publications').select('user_id,membership_id,public_slug,publication_consent,discoverable,approved_at,display_name_mode,show_avatar,show_country,show_city,show_property').order('updated_at',{ascending:false}).limit(50),
  ]);
  const applications=applicationResult.data??[],memberships=membershipResult.data??[],publications=publicationResult.data??[];
  const pendingResult=await sb.from('founding_applications').select('id',{count:'exact',head:true}).in('status',['pending','under_review','awaiting_payment']);
  const requiringAction=await sb.from('circle_membership_payments').select('id',{count:'exact',head:true}).in('status',['submitted']);
  const userIds=[...new Set(applications.map(application=>application.applicant_user_id))],propertyIds=[...new Set(applications.map(application=>application.property_id).filter((id):id is string=>Boolean(id)))];
  const [{data:profiles},{data:properties}]=await Promise.all([
    userIds.length?sb.from('profiles').select('id,full_name,business_name,email').in('id',userIds):Promise.resolve({data:[]}),
    propertyIds.length?sb.from('hotels').select('id,name').in('id',propertyIds):Promise.resolve({data:[]}),
  ]);
  const profileById=new Map((profiles??[]).map(profile=>[profile.id,profile])),propertyById=new Map((properties??[]).map(property=>[property.id,property]));
  const rows:AdminApplicationRow[]=applications.map(application=>{
    const profile=profileById.get(application.applicant_user_id),category=application.application_type==='creator'?'Founding Creator':application.application_type==='host'?(application.experience_id?'Experience Partner':'Stay Partner'):'Founding Traveler';
    return {id:application.id,name:profile?.full_name??profile?.business_name??'Applicant profile incomplete',business:application.property_id?propertyById.get(application.property_id)?.name??profile?.business_name??null:profile?.business_name??null,email:profile?.email??null,category,tier:tierName(application.requested_tier_code),status:application.status,submittedAt:application.submitted_at,updatedAt:application.reviewed_at};
  });
  const pending=pendingResult.count??0,approved=approvedResult.count??0,rejected=rejectedResult.count??0;
  const travelerCount=travelerResult.count??0,hostCount=hostResult.count??0,experiencePartnerCount=experiencePartnerResult.count??0,stayPartnerCount=stayPartnerResult.count??0,creatorCount=creatorResult.count??0;
  const campaign=campaignResult.data?.[0],travelerAllocation=allocationResult.data?.find(item=>item.application_type==='traveler'),hostAllocation=allocationResult.data?.find(item=>item.application_type==='host');
  return <div className="admin-command">
    <header className="admin-command__intro"><div><span className="admin-eyebrow">Ramah Digital · Founding Operations</span><h1>Command center</h1><p>Review applications, clear payment checks, and manage existing Founder operations from one secured workspace.</p></div><aside><small>Campaign</small><strong>{label(campaign?.status)}</strong><span>{campaign?.name??'No campaign record returned'}</span></aside></header>
    {(q.error||q.notice)&&<p className={q.error?'form-error':'notice'} role={q.error?'alert':'status'}>{q.error??q.notice}</p>}
    {applicationResult.error&&<p className="form-error" role="alert">Applications could not be loaded. {applicationResult.error.message}</p>}
    <section className="admin-kpis" aria-label="Founding Era operational metrics">
      <Metric label="Total applications" value={applicationResult.count??applications.length} detail="All submitted records"/>
      <Metric label="Pending review" value={pending} detail="Pending, in review or awaiting payment"/>
      <Metric label="Approved" value={approved} detail="Application status"/>
      <Metric label="Rejected" value={rejected} detail="Application status"/>
      <Metric label="Founding Travelers" value={travelerCount} detail="All recorded applications"/>
      <Metric label="Partner applications" value={hostCount} detail="Stay + Experience Partners"/>
      <Metric label="Stay Partners" value={stayPartnerCount} detail="All recorded applications"/>
      <Metric label="Experience Partners" value={experiencePartnerCount} detail="All recorded applications"/>
      <Metric label="Founding Creators" value={creatorCount} detail="All recorded applications"/>
      <Metric label="Document backlog" value={documentResult.count??0} detail={documentResult.error?'Count unavailable':'Awaiting document review'}/>
      <Metric label="Payment backlog" value={requiringAction.count??0} detail={requiringAction.error?'Count unavailable':'Submitted for Finance review'}/>
      <Metric label="Active memberships" value={activeMembershipResult.count??0} detail="Exact database count"/>
      <Metric label="Traveler capacity left" value={Math.max(0,(campaign?.traveler_capacity??0)-(travelerAllocation?.activated_count??0))} detail="Campaign allocation"/>
      <Metric label="Host capacity left" value={Math.max(0,(campaign?.host_capacity??0)-(hostAllocation?.activated_count??0))} detail="Stay + Experience allocation"/>
    </section>
    <AdminApplicationTable rows={rows}/>
    <section className="admin-operations-nav" aria-label="Other Founder operations">
      <Link href="/founding-admin/documents"><span>01</span><strong>Document review</strong><small>Secure private evidence · {documentResult.count??0} awaiting review</small><b aria-hidden="true">→</b></Link>
      <Link href="/founding-admin/launch"><span>02</span><strong>Launch readiness</strong><small>Review inventory, moderation and activation readiness</small><b aria-hidden="true">→</b></Link>
      <Link href="/founding-admin/testing"><span>03</span><strong>Testing access</strong><small>Controlled internal test-account permissions</small><b aria-hidden="true">→</b></Link>
      <a href="#founder-hall"><span>04</span><strong>Founder Hall</strong><small>Review consent and public-field choices</small><b aria-hidden="true">↓</b></a>
    </section>
    <section className="admin-memberships" aria-labelledby="membership-register-title"><header><div><span className="admin-eyebrow">Permanent identities</span><h2 id="membership-register-title">Membership register</h2><p>Founder numbers and membership status are read from the canonical account records.</p></div><span>Latest {memberships.length}</span></header><div className="admin-membership-list">{memberships.length?memberships.map(member=>{const profile=profileById.get(member.user_id);return <article key={member.id}><span className="admin-membership-number">{member.founder_number??'Pending number'}</span><div><span className={`status-pill status-${member.membership_status}`}>{label(member.membership_status)}</span><strong>{profile?.full_name??profile?.business_name??'Ramah member'}</strong><small>{member.circle_type==='host'?'Founding Partner':'Founding Traveler'} · {tierName(member.tier_code)}</small></div><span className="admin-muted">{member.founder_status?'Founding identity':'Membership record'}</span></article>}) : <p className="admin-empty">No membership records have been activated.</p>}</div></section>
    <section className="admin-memberships" id="founder-hall" aria-labelledby="founder-hall-title"><header><div><span className="admin-eyebrow">Consent archive</span><h2 id="founder-hall-title">Founder Hall review</h2><p>Only approve information the Founder explicitly consented to share. Contact and payment details are never made public here.</p></div></header><div className="admin-publication-list">{publications.length?publications.map(publication=><article key={publication.user_id}><div><strong>{publication.public_slug}</strong><small>{publication.discoverable?'Discoverability requested':'Private record'} · {label(publication.display_name_mode)}</small><span className={`status-pill ${publication.publication_consent?'status-approved':'status-rejected'}`}>{publication.publication_consent?'Consent recorded':'No consent'}</span></div><div className="admin-publication-fields"><span>Photo {publication.show_avatar?'Included':'Hidden'}</span><span>Country {publication.show_country?'Included':'Hidden'}</span><span>City {publication.show_city?'Included':'Hidden'}</span><span>Property {publication.show_property?'Included':'Hidden'}</span></div>{!publication.approved_at&&<ConfirmedActionForm action={reviewPublication} className="admin-publication-action" confirmation="Review this publication consent decision? This changes whether the record can appear publicly."><input type="hidden" name="id" value={publication.user_id}/><label>Review reason<input name="reason" required minLength={3} placeholder="Consent review reason"/></label><ActionSubmitButton name="decision" value="approve" className="button dark" loadingText="Approving…" disabled={!publication.publication_consent}>Approve public record</ActionSubmitButton><ActionSubmitButton name="decision" value="reject" className="button" loadingText="Saving…">Keep private</ActionSubmitButton></ConfirmedActionForm>}</article>):<p className="admin-empty">No Founder Hall publication records are available.</p>}</div></section>
    <p className="admin-data-note">Operational counts are queried from the authorized Supabase session. The applicant register lists the newest 100 applications; total and status KPIs use exact database counts.</p>
  </div>;
}

function Metric({label,value,detail}:{label:string;value:number;detail:string}){return <article><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>}
