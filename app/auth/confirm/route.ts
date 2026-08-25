import {createClient} from '@/lib/supabase/server';
import {NextResponse} from 'next/server';

// Retained as the generic Supabase PKCE callback for recovery or future magic-link
// flows. Account registration no longer sends users through this route.
export async function GET(request:Request){
  const url=new URL(request.url),code=url.searchParams.get('code'),next=url.searchParams.get('next')??'/portal';
  if(code){
    const sb=await createClient();
    const {error}=await sb.auth.exchangeCodeForSession(code);
    if(!error)return NextResponse.redirect(new URL(next,url.origin));
  }
  return NextResponse.redirect(new URL('/auth/sign-in?error=Authentication link is unavailable',url.origin));
}
