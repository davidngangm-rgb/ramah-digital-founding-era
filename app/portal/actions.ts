"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

const text=(form:FormData,key:string)=>String(form.get(key)??"").trim();
const applicationError=(message:string)=>`/portal/apply?error=${encodeURIComponent(message)}`;

export async function submitApplication(form:FormData){
  const sb=await createClient();
  const {data:{user}}=await sb.auth.getUser();
  if(!user)redirect("/auth/sign-in?next=/portal/apply");

  const type=text(form,"applicationType")==="host"?"host":"traveler";
  const partnerVertical=type==="host"&&text(form,"partnerVertical")==="experience"?"experience":"stay";
  const campaignCode=text(form,"campaignCode");

  // The page progress indicator is advisory. These owner-scoped checks are the
  // final web boundary before the canonical submission RPC is called.
  if(type==="traveler"){
    const {data:profile,error}=await sb.from("profiles").select("full_name,location").eq("id",user.id).maybeSingle();
    if(error)redirect(applicationError(error.message));
    if(!profile?.full_name?.trim()||!profile?.location?.trim())redirect(applicationError("Complete your name and location in Traveler onboarding before submitting for Founder review."));
  }

  if(type==="host"&&partnerVertical==="stay"){
    const propertyId=text(form,"propertyId");
    const {data:property,error}=await sb.from("hotels").select("id,status,operational_status").eq("id",propertyId).eq("owner_id",user.id).maybeSingle();
    if(error)redirect(applicationError(error.message));
    if(!property)redirect(applicationError("The submitted property is not owned by this account."));
    if(property.status!=="pending_verification"&&property.operational_status!=="pending_verification")redirect(applicationError("Complete the property, initial room and securely stored launch video before submitting for Founder review."));
  }

  const required=["terms_of_service","privacy_policy","membership_agreement","hall_of_founders_policy","refund_policy","community_guidelines"];
  if(required.some(code=>form.get(code)!=="on"))redirect(applicationError("All required policies must be accepted"));
  const versions=Object.fromEntries(required.map(code=>[code,"founding-2026-v1"]));
  const {error:acceptanceError}=await sb.rpc("record_founding_legal_acceptance",{
    p_campaign_code:campaignCode,
    p_policy_versions:versions,
    p_evidence:{source:"founding_website",userAgentRecorded:false,partnerVertical}
  });
  if(acceptanceError)redirect(applicationError(acceptanceError.message));

  const common={
    p_campaign_code:campaignCode,
    p_tier_code:text(form,"tierCode"),
    p_applicant_note:text(form,"note")||null,
    p_idempotency_key:text(form,"idempotencyKey"),
    p_referral_code:text(form,"referralCode")||null
  };
  const {error}=partnerVertical==="experience"
    ?await sb.rpc("submit_experience_partner_founding_application",{
      ...common,
      p_partner_account_id:text(form,"partnerAccountId"),
      p_experience_id:text(form,"experienceId")
    })
    :await sb.rpc("submit_founding_application",{
      ...common,
      p_application_type:type,
      p_property_id:text(form,"propertyId")||null
    });
  if(error)redirect(applicationError(error.message));
  redirect("/portal?notice=Application submitted");
}

export async function savePublication(form:FormData){
  const sb=await createClient();
  const yes=(key:string)=>form.get(key)==="on";
  const {error}=await sb.rpc("update_founder_publication",{
    p_publication_consent:yes("consent"),
    p_display_name_mode:text(form,"displayNameMode"),
    p_custom_display_name:text(form,"customName")||null,
    p_show_avatar:yes("showAvatar"),
    p_show_country:yes("showCountry"),
    p_show_city:yes("showCity"),
    p_founder_story:text(form,"story")||null,
    p_discoverable:yes("discoverable"),
    p_show_property:yes("showProperty")
  });
  if(error)redirect(`/portal?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/portal");
  redirect("/portal?notice=Publication preferences sent for review");
}

export async function ensureCreatorReferral(){
  const sb=await createClient();
  const {error}=await sb.rpc("create_my_referral_code");
  if(error)redirect(`/portal?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/portal");
  redirect("/portal?notice=Your approved Creator referral link is ready");
}
