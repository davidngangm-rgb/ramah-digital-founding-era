import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
async function onboardingProgress(){
  const source=read('lib/onboarding-progress.ts');
  const js=ts.transpile(source,{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022});
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}

test('Traveler profile save advances only after required name and city are persisted',async()=>{
  const {travelerProfileNextStep}=await onboardingProgress();
  assert.equal(travelerProfileNextStep(' Amina ',' Nairobi '),'/portal/apply?notice=Profile saved. Review your selected membership to continue.');
  assert.match(travelerProfileNextStep('Amina',' '),/portal\/onboarding\?notice=.*#profile/);
  const action=read('app/portal/onboarding/actions.ts');
  assert.match(action,/select\('id'\)\.single\(\)/);
  assert.match(action,/travelerProfileNextStep\(fullName,city\)/);
});

test('Stay Partner save navigation preserves three complete-room and readiness gates',async()=>{
  const {stayRoomNextStep}=await onboardingProgress();
  assert.equal(stayRoomNextStep(0),'#rooms');
  assert.equal(stayRoomNextStep(2),'#rooms');
  assert.equal(stayRoomNextStep(3),'#payment-methods');
  const action=read('app/portal/onboarding/actions.ts');
  assert.match(action,/completeCount>=3/);
  assert.match(action,/submit_stay_partner_onboarding_readiness/);
  assert.match(action,/Continue with room inventory.#rooms/);
});

test('Experience Partner saves move to the next persisted step without bypassing readiness',()=>{
  const actions=read('app/portal/onboarding/experience/actions.ts');
  assert.match(actions,/Continue with your initial experience.#experience/);
  assert.match(actions,/Continue by adding a future availability session\./);
  assert.match(actions,/#availability/);
  assert.match(actions,/#launch-video/);
  assert.match(actions,/submit_experience_partner_onboarding_readiness/);
});

test('application confirmation uses persisted application identity, status, tier and safe payment language',()=>{
  const component=read('components/ApplicationSubmittedState.tsx'),dashboard=read('app/portal/page.tsx');
  for(const content of ['Thank you for applying to the','awaiting review','Do not make any payment to an unverified account or individual','No membership payment is required','Creator recruitment is currently free','Founder Admin makes the final approval decision'])assert.ok(component.includes(content),content);
  assert.match(component,/application\.id/);
  assert.match(component,/application\.status/);
  assert.match(component,/tierName\(application\.requested_tier_code\)/);
  assert.match(dashboard,/application\.submitted_at/);
  assert.match(dashboard,/membershipActive=\{active\}/);
  assert.doesNotMatch(component,/active=Boolean\(identity\?\.founderNumber\)\|\|approved/);
});

test('email verification accepts six-digit signup OTP, handles retry, resend throttling, and link callbacks',()=>{
  const page=read('app/auth/verify-email/page.tsx'),otp=read('components/OtpCodeInput.tsx'),resend=read('components/ResendSignupCodeForm.tsx'),actions=read('app/auth/actions.ts'),confirm=read('app/auth/confirm/route.ts');
  assert.match(page,/OtpCodeInput/);
  assert.match(otp,/pattern="\[0-9\]\{6\}"/);
  assert.match(otp,/inputMode="numeric"/);
  assert.match(otp,/autoComplete="one-time-code"/);
  assert.match(otp,/replace\(\/\\D\/g,''\)/);
  assert.match(page,/verifySignupCode/);
  assert.match(page,/ResendSignupCodeForm/);
  assert.match(resend,/COOLDOWN_SECONDS=60/);
  assert.match(resend,/localStorage/);
  assert.match(actions,/verifyOtp\(\{email,token,type:'signup'\}\)/);
  assert.match(actions,/verifyOtp\(\{email,token,type:'recovery'\}\)/);
  assert.match(actions,/auth\.resend\(\{type:'signup',email\}\)/);
  assert.match(confirm,/exchangeCodeForSession\(code\)/);
  assert.match(confirm,/verifyOtp\(\{token_hash:tokenHash!/);
  assert.match(confirm,/requestedType==='recovery'/);
});

test('authentication uses the real Ramah asset and shared accessible pending-action control',()=>{
  const brand=read('components/AuthBrand.tsx'),button=read('components/ActionSubmitButton.tsx'),css=read('styles/founding-platform.css');
  assert.match(brand,/ramah-app-icon\.png/);
  assert.match(brand,/Ramah Digital home/);
  assert.match(button,/useFormStatus/);
  assert.match(button,/disabled=\{disabled\|\|busy\}/);
  assert.match(button,/aria-busy=\{busy\|\|undefined\}/);
  assert.match(button,/useFormStatus\(\)/);
  assert.match(button,/data\.get\(props\.name\)/);
  assert.match(button,/action-submit__spinner/);
  for(const route of ['sign-in','sign-up','verify-email','verify-recovery','forgot-password','reset-password']){
    assert.match(read(`app/auth/${route}/page.tsx`),/AuthBrand/);
  }
  assert.match(css,/prefers-reduced-motion: reduce/);
  assert.match(css,/\.otp-code__slots/);
});

test('Founding submission still uses canonical server RPC and does not activate membership',()=>{
  const submit=read('app/portal/actions.ts'),creator=read('app/(public)/creators/apply/actions.ts');
  assert.match(submit,/submit_founding_application/);
  assert.match(submit,/submit_experience_partner_founding_application/);
  assert.match(submit,/redirect\("\/portal\?notice=Application submitted"\)/);
  assert.match(creator,/submit_creator_application/);
  assert.match(creator,/return \{ok:true as const,href:'\/portal\?notice=Application successfully submitted'\}/);
  assert.doesNotMatch(submit,/activate_founding_member/);
  assert.doesNotMatch(creator,/activate_founding_member/);
});
