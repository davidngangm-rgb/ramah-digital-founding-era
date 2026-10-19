"use server";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

const text=(form:FormData,key:string)=>String(form.get(key)??"").trim();
const creatorPlans=new Set(["creator_plus","creator_pro"]);
function mediaUrl(form:FormData,key:string,bucket:string,userId:string){const value=text(form,key);if(!value)return null;const base=(process.env.NEXT_PUBLIC_SUPABASE_URL??"").replace(/\/$/,"");const prefix=`${base}/storage/v1/object/public/${bucket}/${userId}/`;if(!value.startsWith(prefix))throw new Error(`Invalid ${bucket} storage reference`);return value}

export async function submitCreatorApplication(form:FormData){
  const sb=await createClient();
  const {data:{user}}=await sb.auth.getUser();
  if(!user)return {ok:false as const,error:'Your session expired. Sign in again, then retry.'};
  const tierCode=text(form,"tierCode");
  if(!creatorPlans.has(tierCode))return {ok:false as const,error:'Choose Creator Plus or Creator Pro.'};
  const places=text(form,"places").split(",").map(value=>value.trim()).filter(Boolean).slice(0,12);
  const workExamples=text(form,"workExamples").split(/\r?\n/).map(value=>value.trim()).filter(Boolean).slice(0,8).map(value=>({url:value}));
  if(text(form,"displayName").length<2||!text(form,"homeBase")||text(form,"creatorStory").length<40||text(form,"circleIntent").length<40){
    return {ok:false as const,error:'Add your Creator name and home base, then give at least 40 characters for your story and Circle idea.'};
  }
  if(workExamples.some(item=>{try{const url=new URL(item.url);return !["http:","https:"].includes(url.protocol)}catch{return true}})){
    return {ok:false as const,error:'Work examples must be valid http or https links, one per line.'};
  }
  let avatar:string|null,cover:string|null;
  try{avatar=mediaUrl(form,"avatarUrl","avatars",user.id);cover=mediaUrl(form,"coverUrl","covers",user.id)}catch(error){return {ok:false as const,error:error instanceof Error?error.message:'Invalid media reference'}}
  const {data:currentProfile,error:currentProfileError}=await sb.from("profiles").select("avatar_url,cover_url").eq("id",user.id).maybeSingle();
  if(currentProfileError)return {ok:false as const,error:currentProfileError.message};
  if(!(avatar??currentProfile?.avatar_url)||!(cover??currentProfile?.cover_url))return {ok:false as const,error:'A securely saved profile picture and cover photo are required before Founder review'};
  const profileValues:Record<string,unknown>={full_name:text(form,"displayName"),bio:text(form,"creatorStory"),location:text(form,"homeBase")};if(avatar)profileValues.avatar_url=avatar;if(cover)profileValues.cover_url=cover;
  const {error:profileError}=await sb.from("profiles").update(profileValues).eq("id",user.id);if(profileError)return {ok:false as const,error:profileError.message};
  const {data:application,error}=await sb.rpc("submit_creator_application",{
    p_campaign_code:process.env.NEXT_PUBLIC_FOUNDING_CAMPAIGN_CODE??"founding-era-2026",
    p_display_name:text(form,"displayName"),p_creator_category:text(form,"category"),
    p_home_base:text(form,"homeBase"),p_places_of_focus:places,
    p_creator_story:text(form,"creatorStory"),p_circle_intent:text(form,"circleIntent"),
    p_audience_description:text(form,"audience")||null,p_work_examples:workExamples,
    p_idempotency_key:text(form,"idempotencyKey")
  });
  if(error)return {ok:false as const,error:error.message};
  const applicationId=application?.id;
  if(!applicationId)return {ok:false as const,error:'Application was submitted but its identifier could not be confirmed. Please check your dashboard before retrying.'};
  const {error:planError}=await sb.rpc("record_creator_intended_plan",{p_application_id:applicationId,p_tier_code:tierCode,p_request_id:crypto.randomUUID()});
  if(planError)return {ok:false as const,error:`Application saved. Confirm the intended plan to complete submission: ${planError.message}`};
  return {ok:true as const,href:'/portal?notice=Application successfully submitted'};
}

export async function recordCreatorIntent(form:FormData){const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/auth/sign-in?next=/creators/apply");const applicationId=text(form,"applicationId"),tierCode=text(form,"tierCode");if(!applicationId||!creatorPlans.has(tierCode))redirect("/creators/apply?error=Choose Creator Plus or Creator Pro");const {error}=await sb.rpc("record_creator_intended_plan",{p_application_id:applicationId,p_tier_code:tierCode,p_request_id:crypto.randomUUID()});if(error)redirect(`/creators/apply?error=${encodeURIComponent(error.message)}`);redirect("/creators/apply?notice=Intended Creator plan recorded. No payment was created")}

export async function selectCreatorPlan(form:FormData){
  const sb=await createClient();
  const {data:{user}}=await sb.auth.getUser();
  if(!user)redirect("/auth/sign-in?next=/creators/apply");
  const applicationId=text(form,"applicationId");
  const tierCode=text(form,"tierCode");
  if(!applicationId||!creatorPlans.has(tierCode)){
    redirect("/creators/apply?error=Choose Creator Plus or Creator Pro");
  }
  const {error}=await sb.rpc("select_creator_founding_plan",{
    p_application_id:applicationId,
    p_tier_code:tierCode,
    p_request_id:crypto.randomUUID()
  });
  if(error)redirect(`/creators/apply?error=${encodeURIComponent(error.message)}`);
  redirect("/creators/apply?notice=Creator plan selected. No payment has been initiated");
}
