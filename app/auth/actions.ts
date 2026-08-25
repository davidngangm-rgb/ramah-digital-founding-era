"use server";

import {createClient} from '@/lib/supabase/server';
import {getStaffAccess,hasFoundingAdminAccess} from '@/lib/staff';
import {redirect} from 'next/navigation';

function text(form:FormData,key:string){return String(form.get(key)??'').trim()}

export async function signIn(form:FormData){
  const sb=await createClient();
  const email=text(form,'email'),password=text(form,'password'),next=text(form,'next');
  const {error}=await sb.auth.signInWithPassword({email,password});
  if(error)redirect(`/auth/sign-in?error=${encodeURIComponent(error.message)}`);
  const access=await getStaffAccess(sb);
  if(hasFoundingAdminAccess(access))redirect('/founding-admin');
  redirect(next.startsWith('/')?next:'/portal');
}

export async function signUp(form:FormData){
  const sb=await createClient();
  const type=text(form,'type')==='host'?'host':'traveler';
  const email=text(form,'email'),password=text(form,'password'),name=text(form,'name'),propertyType=text(form,'propertyType'),propertyName=text(form,'propertyName');
  const role=type==='host'?'hotel_partner':'traveler';
  const {data,error}=await sb.auth.signUp({email,password,options:{data:{
    role,
    full_name:name,
    business_name:type==='host'?propertyName:undefined,
    property_type:type==='host'?propertyType:undefined,
  }}});
  if(error)redirect(`/auth/sign-up?type=${type}&error=${encodeURIComponent(error.message)}`);
  const isNewAccount=(data.user?.identities?.length??0)>0;

  // Email confirmation is disabled for the Founding Era. Supabase normally
  // returns a session here; the fallback still authenticates through Supabase.
  let user=data.user;
  if(!data.session){
    const {data:signedIn,error:signInError}=await sb.auth.signInWithPassword({email,password});
    if(signInError||!signedIn.session||!signedIn.user){
      redirect(`/auth/sign-up?type=${type}&error=${encodeURIComponent('Your account was created, but an authenticated session could not be started. Please sign in to continue.')}`);
    }
    user=signedIn.user;
  }
  if(!user)redirect(`/auth/sign-up?type=${type}&error=${encodeURIComponent('Your Ramah account could not be created. Please try again.')}`);

  if(isNewAccount){
    const {error:profileError}=await sb.from('profiles').upsert({
      id:user.id,
      email,
      full_name:name,
      role,
      business_name:type==='host'?propertyName:null,
      property_type:type==='host'?propertyType:null,
    },{onConflict:'id'});
    if(profileError)redirect(`/auth/sign-up?type=${type}&error=${encodeURIComponent('Your account is ready, but your Ramah profile could not be initialized. Please sign in and try again.')}`);
  }

  redirect('/portal/onboarding');
}

export async function signOut(){const sb=await createClient();await sb.auth.signOut();redirect('/')}
