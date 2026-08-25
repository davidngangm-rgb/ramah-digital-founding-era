import {createClient} from '@/lib/supabase/server';
import {getCampaignApplicationAccess} from '@/lib/foundingCampaign';
import {submitApplication} from '../actions';

type Offer={application_type:'traveler'|'host';tier_code:string;display_name:string;amount:number|string};

export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,sb=await createClient(),campaignCode=process.env.NEXT_PUBLIC_FOUNDING_CAMPAIGN_CODE??'founding-era-2026';
  const [{data:campaign},{data:{user}},{data:offers}]=await Promise.all([
    sb.rpc('get_founding_campaign_status',{p_campaign_code:campaignCode}),sb.auth.getUser(),
    sb.rpc('get_founding_membership_offers',{p_application_type:null}),
  ]);
  const role=user?.user_metadata?.role,type=role==='hotel_partner'?'host':'traveler';
  const {data:ownedProperty}=type==='host'&&user?await sb.from('hotels').select('id,name').eq('owner_id',user.id).order('created_at').limit(1).maybeSingle():{data:null};
  const available=((offers??[]) as Offer[]).filter(t=>t.application_type===type);
  const access=getCampaignApplicationAccess(campaign?.campaignStatus,user);
  return <section className="form-page">
    <span className="eyebrow">Step 2 of 4 · Membership</span><h1>Choose your membership.</h1>
    <p>Your membership tier and permanent Founder identity are separate. Your selected tier remains attached to this Ramah account after approval and activation. No Founder Number is reserved during onboarding.</p>
    {q.error&&<p className="form-error">{q.error}</p>}
    {access.authorizedPreLaunchTest&&<p className="test-access-notice" role="status"><b>Authorized pre-launch testing</b>This account can complete the real Founding Era lifecycle before public applications open. Capacity and approval rules remain enforced.</p>}
    {access.allowed?<form action={submitApplication} className="application-form">
      <input type="hidden" name="campaignCode" value={campaignCode}/><input type="hidden" name="applicationType" value={type}/><input type="hidden" name="idempotencyKey" value={crypto.randomUUID()}/>
      <label>Founder category<input value={type==='host'?'Founding Host':'Founding Traveler'} readOnly/></label>
      <label>Membership tier<select name="tierCode" required defaultValue=""><option value="" disabled>Select a membership</option>{available.map(t=><option value={t.tier_code} key={t.tier_code}>{t.display_name} — {Number(t.amount)===0?'FREE':`US$${Number(t.amount)}`} one-time</option>)}</select></label>
      {type==='host'&&ownedProperty?<><input type="hidden" name="propertyId" value={ownedProperty.id}/><div className="application-property"><span>Applying with your property</span><strong>{ownedProperty.name}</strong><small>Only the property owned by this Ramah account can be submitted.</small></div></>:null}
      <label>Referral code <span>Optional</span><input name="referralCode" maxLength={16}/></label><label>What brings you to Ramah? <span>Optional</span><textarea name="note" maxLength={1000}/></label>
      <fieldset><legend>Required legal acceptance</legend><label><input type="checkbox" name="terms_of_service" required/> Terms of Service</label><label><input type="checkbox" name="privacy_policy" required/> Privacy Policy</label><label><input type="checkbox" name="membership_agreement" required/> Membership Agreement</label><label><input type="checkbox" name="hall_of_founders_policy" required/> Founder Hall Policy</label><label><input type="checkbox" name="refund_policy" required/> Refund Policy</label><label><input type="checkbox" name="community_guidelines" required/> Community Guidelines</label></fieldset>
      <p className="muted">Acceptance is recorded with your account, UTC timestamp, policy versions and submission evidence.</p>{type==='host'&&!ownedProperty?<div className="form-error" role="alert">Create and review your property before submitting a Founding Host application. <a href="/portal/onboarding#property-type">Continue property onboarding</a></div>:<button className="button dark">Submit application</button>}
    </form>:<div className="empty-state campaign-coming-soon"><b>{campaign?.campaignStatus==='scheduled'?'The Founding Era begins 30 August 2026.':'The Founding Era is not accepting new applications.'}</b><p>{campaign?.campaignStatus==='scheduled'?'Your Ramah account and onboarding progress remain saved. Public membership applications open automatically at launch and continue for 60 days.':'Existing Founder identities remain permanent, but new applications are unavailable.'}</p>{campaign?.campaignStartsAt&&<time dateTime={campaign.campaignStartsAt}>Official opening: {new Date(campaign.campaignStartsAt).toLocaleString('en',{dateStyle:'long',timeStyle:'short',timeZone:'UTC'})} UTC</time>}</div>}
  </section>;
}
