import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const migration=()=>read('../supabase/migrations/20261016000001_founding_manual_finance_activation.sql');

test('successful Traveler and Partner submissions enter the dashboard only after the RPC succeeds',()=>{
  const portal=read('app/portal/actions.ts');
  const creator=read('app/(public)/creators/apply/actions.ts');
  assert.match(portal,/if\(error\)redirect[\s\S]*redirect\("\/portal\?notice=Application submitted"\)/);
  assert.match(creator,/if\(planError\)redirect[\s\S]*redirect\("\/portal\?notice=Application successfully submitted"\)/);
});

test('applicant-facing Founding payment initiation is disabled without touching booking payments',()=>{
  const sql=migration();
  assert.match(sql,/revoke execute on function public\.create_membership_payment[\s\S]*authenticated,anon/);
  assert.match(sql,/revoke execute on function public\.submit_membership_payment[\s\S]*authenticated,anon/);
  assert.doesNotMatch(sql,/create_launch_booking_request|bookings|experience_bookings/);
  assert.match(read('app/portal/payment/page.tsx'),/redirect\('\/portal'\)/);
});

test('Finance verification is least-privilege, external, non-sensitive, and audited',()=>{
  const sql=migration();
  assert.match(sql,/founding\.payments\.verify/);
  assert.match(sql,/provider='offline_finance'/);
  assert.match(sql,/non-sensitive Finance reference is required/);
  assert.match(sql,/circle_membership_payment_audit_log/);
  assert.match(sql,/staff_audit_log/);
  assert.doesNotMatch(sql,/card_number|bank_account|cvv|routing_number/i);
});

test('verified payment cannot activate without final approval and paid approval cannot precede Finance',()=>{
  const sql=migration();
  assert.match(sql,/Finance verification is required before final approval/);
  assert.match(sql,/review_founding_application[\s\S]*activate_founding_member/);
  assert.match(sql,/application\.status<>'approved'/);
  assert.match(sql,/commit together or roll back together/);
});

test('free Community membership bypasses Finance while preserving the atomic activation ledger',()=>{
  const sql=migration();
  assert.match(sql,/not offer\.payment_required or offer\.amount=0/);
  assert.match(sql,/provider,manual_reference/);
  assert.match(sql,/'not_required'/);
  assert.match(sql,/'payment-not-required:'\|\|application\.id/);
});

test('Partner readiness remains server-authoritative for three rooms and one complete experience',()=>{
  const submission=read('app/portal/actions.ts');
  const readiness=read('../supabase/migrations/20261014000001_founding_partner_onboarding_readiness.sql');
  assert.match(submission,/pending_verification/);
  assert.match(submission,/submit_experience_partner_founding_application/);
  assert.match(readiness,/complete_rooms<3/);
  assert.match(readiness,/A persisted experience launch video is required/);
  assert.match(readiness,/At least one future available session is required/);
  assert.match(readiness,/Business verification and representative identity documents are required/);
});

test('private Partner evidence uses authenticated owner uploads and signed reviewer links',()=>{
  const sql=read('../supabase/migrations/20261013500001_founding_private_verification_documents.sql');
  const upload=read('components/DirectUploadForm.tsx');
  const review=read('app/founding-admin/documents/page.tsx');
  assert.match(sql,/founding-verification-documents',false,10485760/);
  assert.match(sql,/storage\.foldername\(name\)/);
  assert.match(sql,/founding\.applications\.review/);
  assert.match(upload,/input\.dataset\.uploadPrivate==='true'/);
  assert.match(review,/createSignedUrls\(paths,600\)/);
});

test('Creator recruitment stays free and referral access requires separate verification',()=>{
  const sql=migration();
  const creator=read('app/(public)/creators/apply/actions.ts');
  assert.match(sql,/Creator recruitment payment is deferred/);
  assert.match(sql,/creatorPaidActivationDeferred/);
  assert.match(sql,/creator_profiles[\s\S]*verification_status='approved'/);
  assert.match(sql,/separate Creator verification are required for referral access/);
  assert.doesNotMatch(creator,/create_membership_payment|submit_membership_payment/);
});

test('final activation remains permission-controlled, idempotent, and entitlement-backed',()=>{
  const sql=migration();
  const canonical=read('../supabase/migrations/20260803000014_founding_era_production_configuration.sql');
  const recognition=read('../supabase/migrations/20261011000001_founding_era_recognition_alignment.sql');
  assert.match(sql,/founding\.applications\.review/);
  assert.match(sql,/founding\.members\.activate/);
  assert.match(sql,/idempotentReplay/);
  assert.match(canonical,/founding_activation_requests/);
  assert.match(canonical,/founding_benefit_assignments/);
  assert.match(canonical,/member_badges/);
  assert.match(canonical,/membership_credentials/);
  assert.match(recognition,/reconcile_founding_membership_artifacts/);
});

test('rejected or unauthorized paths cannot receive Finance or active privileges',()=>{
  const sql=migration();
  assert.match(sql,/application\.status in \('rejected','withdrawn','expired'\)/);
  assert.match(sql,/Permission denied/);
  assert.match(sql,/Approved application required|status<>'approved'/);
});

test('dashboard uses the official pending and active confirmation states',()=>{
  const submitted=read('components/ApplicationSubmittedState.tsx');
  const dashboard=read('app/portal/page.tsx');
  for(const copy of ['Thank you for joining the','successfully submitted to the Ramah Digital Founding Team','Finance Team will contact you','Pending review'])assert.match(submitted,new RegExp(copy));
  assert.match(dashboard,/Your membership is now active/);
  assert.match(dashboard,/eligible privileges have been assigned/);
});
