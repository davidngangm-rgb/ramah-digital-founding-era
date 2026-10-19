import {createClient} from '@/lib/supabase/server';
import {NextResponse} from 'next/server';

// Retained as the generic Supabase PKCE callback for recovery or future magic-link
// flows. Account registration no longer sends users through this route.
export async function GET(request:Request){
  const url=new URL(request.url),code=url.searchParams.get('code'),tokenHash=url.searchParams.get('token_hash'),requested=url.searchParams.get('next')??'/portal',requestedType=url.searchParams.get('type');
  const next=requested.startsWith('/')&&!requested.startsWith('//')?requested:'/portal';
  if(code||tokenHash){
    const sb=await createClient();
    const result=code
      ?await sb.auth.exchangeCodeForSession(code)
      :await sb.auth.verifyOtp({token_hash:tokenHash!,type:requestedType==='recovery'?'recovery':requestedType==='email'?'email':'signup'});
    if(!result.error&&result.data.user){
      const metadata=result.data.user.user_metadata??{};
      const {error:profileError}=await sb.from('profiles').upsert({id:result.data.user.id,email:result.data.user.email,full_name:String(metadata.full_name??''),role:String(metadata.role??'traveler'),business_name:metadata.business_name??null,property_type:metadata.property_type??null},{onConflict:'id',ignoreDuplicates:true});
      if(!profileError){
        const isSignup=requestedType==='signup'||(!requestedType&&next.startsWith('/portal/onboarding'));
        if(isSignup){const category=metadata.creator_application_intent?'creator':metadata.role==='hotel_partner'?(metadata.partner_vertical==='experience'?'experience_partner':'stay_partner'):'traveler';const destination=new URL(next,url.origin);destination.searchParams.set('rd_event','sign_up');destination.searchParams.set('rd_category',category);destination.searchParams.set('rd_verified','1');return NextResponse.redirect(destination)}
        return NextResponse.redirect(new URL(next,url.origin));
      }
    }
  }
  const failure=new URL('/auth/sign-in',url.origin);failure.searchParams.set('error','This authentication link is invalid or has expired. Request a new code or recovery email.');return NextResponse.redirect(failure);
}
