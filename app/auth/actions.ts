"use server";

import {createClient} from '@/lib/supabase/server';
import {getStaffAccess,hasFoundingAdminAccess} from '@/lib/staff';
import {redirect} from 'next/navigation';
import {parseMembershipSelection} from '@/lib/memberships';
import {PUBLIC_SITE_URL} from '@/lib/site';

function text(form:FormData,key:string){return String(form.get(key)??'').trim()}
function safeNext(value:string,fallback='/portal'){return value.startsWith('/')&&!value.startsWith('//')?value:fallback}
function withAnalyticsMarker(value:string,event:string,category:string,verified=false){const url=new URL(safeNext(value),'https://ramah.invalid');url.searchParams.set('rd_event',event);url.searchParams.set('rd_category',category);if(verified)url.searchParams.set('rd_verified','1');return `${url.pathname}${url.search}${url.hash}`}

export async function signIn(form:FormData){
  const sb=await createClient();
  const email=text(form,'email'),password=text(form,'password'),next=safeNext(text(form,'next'));
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  if(error)redirect(`/auth/sign-in?error=${encodeURIComponent(error.message)}`);
  if(data.user){
    const intended=new URL(next,'https://ramah.invalid');
    const creatorTier=intended.searchParams.get('creatorTier');
    const selection=parseMembershipSelection(intended.searchParams.get('type'),intended.searchParams.get('tier'));
    const referral=intended.searchParams.get('ref')?.toUpperCase();
    const metadata:Record<string,unknown>={...data.user.user_metadata};
    if(selection){
      metadata.requested_membership_type=selection.kind;
      metadata.requested_membership_tier=selection.tierCode;
      if(selection.kind==='host')metadata.partner_vertical=intended.searchParams.get('vertical')==='experience'?'experience':'stay';
    }
    if(creatorTier&&['creator_plus','creator_pro'].includes(creatorTier)){
      metadata.creator_application_intent=true;
      metadata.requested_creator_tier=creatorTier;
    }
    if(referral&&/^[A-Z0-9]{8,16}$/.test(referral))metadata.requested_founding_referral=referral;
    if(selection||creatorTier||referral)await sb.auth.updateUser({data:metadata});
  }
  const access=await getStaffAccess(sb);
  if(hasFoundingAdminAccess(access))redirect('/founding-admin');
  redirect(next);
}

export async function signUp(form:FormData){
  const sb=await createClient();
  const requestedType=text(form,'type'),creatorIntent=requestedType==='creator',creatorTier=text(form,'tier'),referral=text(form,'referral').toUpperCase();
  if(referral&&!/^[A-Z0-9]{8,16}$/.test(referral))redirect('/?error=Referral link is invalid');
  if(creatorIntent&&!['creator_plus','creator_pro'].includes(creatorTier))redirect('/founding-era/creators');
  const selection=creatorIntent?null:parseMembershipSelection(requestedType,text(form,'tier'));
  if(!creatorIntent&&!selection)redirect('/auth/sign-up?error=Choose a valid membership to continue');
  const type=selection?.kind??'traveler';
  const membershipMetadata=selection?{
    requested_membership_type:type,
    requested_membership_tier:selection.tierCode,
  }:{};
  const vertical=type==='host'&&text(form,'vertical')==='experience'?'experience':'stay';
  const email=text(form,'email'),password=text(form,'password'),name=text(form,'name'),propertyType=text(form,'propertyType'),businessName=text(form,'businessName'),experienceProviderType=text(form,'experienceProviderType');
  if(type==='host'&&businessName.length<2)redirect(`/auth/sign-up?type=host&tier=${selection!.publicTier}&vertical=${vertical}&error=${encodeURIComponent('Business name is required')}`);
  if(type==='host'&&vertical==='stay'&&!propertyType)redirect(`/auth/sign-up?type=host&tier=${selection!.publicTier}&vertical=stay&error=${encodeURIComponent('Property type is required')}`);
  if(type==='host'&&vertical==='experience'&&!['experience_provider','tour_operator'].includes(experienceProviderType))redirect(`/auth/sign-up?type=host&tier=${selection!.publicTier}&vertical=experience&error=${encodeURIComponent('Choose a valid Experience Partner type')}`);
  const role=type==='host'?(vertical==='experience'?'experience_partner':'hotel_partner'):'traveler';
  const destination=creatorIntent?`/creators/apply?tier=${creatorTier}`:type==='host'&&vertical==='experience'?'/portal/onboarding/experience':'/portal/onboarding';
  const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:`${PUBLIC_SITE_URL}/auth/confirm?next=${encodeURIComponent(destination)}`,data:{
    role,
    full_name:name,
    business_name:type==='host'?businessName:undefined,
    property_type:type==='host'&&vertical==='stay'?propertyType:undefined,
    experience_provider_type:type==='host'&&vertical==='experience'?experienceProviderType:undefined,
    partner_vertical:type==='host'?vertical:undefined,
    ...membershipMetadata,
    creator_application_intent:creatorIntent||undefined,
    requested_creator_tier:creatorIntent?creatorTier:undefined,
    requested_founding_referral:referral||undefined,
  }}});
  const referralQuery=referral?`&ref=${referral}`:'';
  const retryPath=creatorIntent?`/auth/sign-up?intent=creator&tier=${creatorTier}${referralQuery}`:`/auth/sign-up?type=${type}&tier=${selection!.publicTier}${type==='host'?`&vertical=${vertical}`:''}${referralQuery}`;
  if(error)redirect(`${retryPath}&error=${encodeURIComponent(error.message)}`);
  const isNewAccount=(data.user?.identities?.length??0)>0;

  let user=data.user;
  if(!data.session){
    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(destination)}`);
  }
  if(!user)redirect(`${retryPath}&error=${encodeURIComponent('Your Ramah account could not be created. Please try again.')}`);

  if(isNewAccount){
    const {error:profileError}=await sb.from('profiles').upsert({
      id:user.id,
      email,
      full_name:name,
      role,
      business_name:type==='host'?businessName:null,
      property_type:type==='host'&&vertical==='stay'?propertyType:null,
    },{onConflict:'id',ignoreDuplicates:true});
    if(profileError)redirect(`${retryPath}&error=${encodeURIComponent('Your account is ready, but your Ramah profile could not be initialized. Please sign in and try again.')}`);
  }

  redirect(isNewAccount?withAnalyticsMarker(destination,'sign_up',creatorIntent?'creator':type==='host'?(vertical==='experience'?'experience_partner':'stay_partner'):'traveler'):destination);
}

export async function verifySignupCode(form:FormData){
  const sb=await createClient(),email=text(form,'email'),token=text(form,'token'),next=safeNext(text(form,'next'));
  if(!/^\d{6}$/.test(token))redirect(`/auth/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&error=${encodeURIComponent('Enter the six-digit verification code.')}`);
  const {data,error}=await sb.auth.verifyOtp({email,token,type:'signup'});
  if(error||!data.user){
    const detail=error?.message.toLowerCase()??'';
    const message=detail.includes('expired')?'This code has expired. Request a new code and try again.':detail.includes('token')||detail.includes('otp')?'That code is not valid. Check the six digits and try again.':'We could not verify that code. Request a new one if the problem continues.';
    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`);
  }
  const metadata=data.user.user_metadata;
  const {error:profileError}=await sb.from('profiles').upsert({id:data.user.id,email:data.user.email??email,full_name:String(metadata.full_name??''),role:String(metadata.role??'traveler'),business_name:metadata.business_name??null,property_type:metadata.property_type??null},{onConflict:'id',ignoreDuplicates:true});
  if(profileError)redirect(`/auth/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&error=${encodeURIComponent('Your email is verified, but profile setup needs attention. Sign in and contact Ramah support if this continues.')}`);
  const metadataCategory=metadata.creator_application_intent?'creator':metadata.role==='hotel_partner'?(metadata.partner_vertical==='experience'?'experience_partner':'stay_partner'):'traveler';
  redirect(withAnalyticsMarker(next,'sign_up',metadataCategory,true));
}

export async function resendSignupCode(form:FormData){
  const sb=await createClient(),email=text(form,'email'),next=safeNext(text(form,'next'));
  const {error}=await sb.auth.resend({type:'signup',email});
  const rateLimited=Boolean(error&&/rate.?limit|too many requests/i.test(error.message));
  const message=rateLimited?'Please wait before requesting another code. Supabase is temporarily limiting verification emails.':'Unable to send a new code. Please try again shortly.';
  redirect(`/auth/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&${error?`error=${encodeURIComponent(message)}${rateLimited?'&cooldown=1':''}`:'resent=1'}`);
}

export async function requestPasswordReset(form:FormData){
  const sb=await createClient(),email=text(form,'email');
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:`${PUBLIC_SITE_URL}/auth/confirm?next=/auth/reset-password`});
  if(error)redirect(`/auth/forgot-password?error=${encodeURIComponent('Unable to request a recovery message right now. Please try again shortly.')}`);
  redirect(`/auth/verify-recovery?email=${encodeURIComponent(email)}`);
}

export async function verifyRecoveryCode(form:FormData){
  const sb=await createClient(),email=text(form,'email'),token=text(form,'token');
  if(!/^\d{6}$/.test(token))redirect(`/auth/verify-recovery?email=${encodeURIComponent(email)}&error=${encodeURIComponent('Enter the six-digit recovery code.')}`);
  const {error}=await sb.auth.verifyOtp({email,token,type:'recovery'});
  if(error){
    const detail=error.message.toLowerCase();
    const message=detail.includes('expired')?'This recovery code has expired. Request a new recovery email.':detail.includes('token')||detail.includes('otp')?'That recovery code is not valid. Check the six digits and try again.':'We could not verify that recovery code. Request another if the problem continues.';
    redirect(`/auth/verify-recovery?email=${encodeURIComponent(email)}&error=${encodeURIComponent(message)}`);
  }
  redirect('/auth/reset-password');
}

export async function resetPassword(form:FormData){
  const sb=await createClient(),password=text(form,'password'),confirmation=text(form,'confirmation');
  if(password.length<8||password!==confirmation)redirect(`/auth/reset-password?error=${encodeURIComponent('Passwords must match and contain at least eight characters.')}`);
  const {data:{user}}=await sb.auth.getUser();
  if(!user)redirect(`/auth/forgot-password?error=${encodeURIComponent('Your recovery session has expired. Request a new code.')}`);
  const {error}=await sb.auth.updateUser({password});
  if(error)redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  await sb.auth.signOut();
  redirect('/auth/sign-in?notice=Password updated. Sign in with your new password.');
}

export async function signOut(){const sb=await createClient();await sb.auth.signOut();redirect('/')}
