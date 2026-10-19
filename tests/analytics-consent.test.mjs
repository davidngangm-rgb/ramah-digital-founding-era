import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('GA is environment-configured and withheld until analytics consent',()=>{
  const provider=read('components/AnalyticsProvider.tsx'),layout=read('app/layout.tsx'),env=read('.env.example');
  assert.match(env,/NEXT_PUBLIC_GA_MEASUREMENT_ID=G-J8EGML1V5R/);
  assert.match(provider,/consent==="granted"&&<>/);
  assert.match(provider,/ANALYTICS_CONSENT_KEY/);
  assert.match(layout,/AnalyticsProvider/);
  assert.match(provider,/Reject optional analytics/);
  assert.match(provider,/Privacy preferences/);
});

test('page views use canonical path only and are deduplicated across route state changes',()=>{
  const analytics=read('lib/analytics.ts'),provider=read('components/AnalyticsProvider.tsx');
  assert.match(analytics,/https:\/\/founding\.ramahdigital\.online\$\{path\}/);
  assert.match(analytics,/safeAnalyticsPath\(window\.location\.pathname\)/);
  assert.match(provider,/page_path:safePath,page_location:safeCanonicalPageLocation\(safePath\)/);
  assert.match(provider,/lastPageview\.current===pathname/);
  assert.doesNotMatch(provider,/page_location:window\.location\.href/);
});

test('event parameters are allowlisted and never include account or upload fields',()=>{
  const analytics=read('lib/analytics.ts');
  assert.match(analytics,/applicant_category: ApplicantCategory/);
  assert.match(analytics,/safeTiers=new Set/);
  assert.match(analytics,/safeSteps=new Set/);
  assert.doesNotMatch(analytics,/email:|phone:|full_name|token:|password|filename|document_id|revenue|value:/i);
});

test('signup and verification analytics markers follow successful Supabase operations only',()=>{
  const auth=read('app/auth/actions.ts'),confirm=read('app/auth/confirm/route.ts');
  assert.match(auth,/redirect\(isNewAccount\?withAnalyticsMarker/);
  assert.match(auth,/await sb\.auth\.verifyOtp\(\{email,token,type:'signup'\}\)/);
  assert.match(auth,/redirect\(withAnalyticsMarker\(next,'sign_up',metadataCategory,true\)\)/);
  assert.match(confirm,/if\(!result\.error&&result\.data\.user\)/);
});

test('application events read canonical persisted status and successful onboarding saves only',()=>{
  const provider=read('components/AnalyticsProvider.tsx'),portal=read('app/portal/page.tsx'),upload=read('components/DirectUploadForm.tsx');
  assert.match(portal,/founding_applications/);
  assert.match(provider,/\["pending","under_review","awaiting_payment"\]\.includes\(status\)/);
  assert.match(provider,/if\(status==="approved"\)/);
  assert.match(upload,/if\(!result\?\.ok\)throw/);
  assert.match(upload,/trackRamahEvent\('onboarding_step_completed'/);
});

test('CSP allows only required Google tag and analytics endpoints, and ad signals remain disabled',()=>{
  const config=read('next.config.ts'),provider=read('components/AnalyticsProvider.tsx');
  assert.match(config,/https:\/\/www\.googletagmanager\.com/);
  assert.match(config,/https:\/\/www\.google-analytics\.com/);
  assert.match(provider,/allow_google_signals:false,allow_ad_personalization_signals:false/);
  assert.match(provider,/ad_personalization:"denied"/);
});
