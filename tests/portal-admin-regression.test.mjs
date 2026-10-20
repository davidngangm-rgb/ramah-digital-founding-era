import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('sign-in uses exact labels, stacked full-width fields, and password manager semantics',()=>{
  const form=read('../components/AuthForm.tsx'),styles=read('../styles/founding-platform.css');
  assert.match(form,/<label>\{mode==='in'\?'Email':'Email address'\}/);
  assert.match(form,/<label htmlFor="auth-password">Password<\/label>/);
  assert.match(form,/autoComplete=\{mode==='in'\?'current-password':'new-password'\}/);
  assert.match(form,/aria-pressed=\{visible\}/);
  assert.match(styles,/\.auth-page \.auth-form > label \{ display: grid; grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(styles,/\.auth-page \.auth-form > label > input,[\s\S]*?width: 100%/);
});

test('member application details scope the record and private evidence to the signed-in owner',()=>{
  const page=read('../app/portal/applications/[id]/page.tsx');
  assert.match(page,/sb\.auth\.getUser\(\)/);
  assert.match(page,/\.eq\('id',id\)\.eq\('applicant_user_id',user\.id\)/);
  assert.match(page,/\.eq\('owner_user_id',user\.id\)/);
  assert.match(page,/createSignedUrls\(paths,600\)/);
});

test('Founder Admin table filters canonical records and actions remain in permission-controlled server routes',()=>{
  const table=read('../components/AdminApplicationTable.tsx'),detail=read('../app/founding-admin/applications/[id]/page.tsx'),actions=read('../app/founding-admin/actions.ts');
  assert.match(table,/query,category,status,tier/);
  assert.match(table,/\/founding-admin\/applications\/\$\{row\.id\}/);
  assert.match(detail,/getStaffAccess\(sb\)/);
  assert.match(detail,/permissions\.includes\('founding\.payments\.verify'\)/);
  assert.match(detail,/permissions\.includes\('founding\.applications\.review'\)/);
  assert.match(actions,/finalize_founding_application/);
  assert.match(actions,/record_founding_finance_status/);
});
