import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transpileModule,ModuleKind,ScriptTarget} from 'typescript';

const component=readFileSync(new URL('../components/DirectUploadForm.tsx',import.meta.url),'utf8');
const snapshot=readFileSync(new URL('../lib/upload-submission.ts',import.meta.url),'utf8');
const policySource=readFileSync(new URL('../lib/upload-policy.ts',import.meta.url),'utf8');

test('upload form and File objects are captured before the first authentication await',()=>{
  const handler=component.slice(component.indexOf('async function submit('),component.indexOf('const media=['));
  assert.ok(handler.indexOf('const form=event.currentTarget')<handler.indexOf('await sb.auth.getUser()'));
  assert.ok(handler.indexOf('captureUploadSubmission(form)')<handler.indexOf('await sb.auth.getUser()'));
  assert.doesNotMatch(handler,/new FormData\(event\.currentTarget\)/);
  assert.match(snapshot,/new FormData\(form\)/);
  assert.match(snapshot,/files:Array\.from\(input\.files\?\?\[\]\)/);
  assert.match(snapshot,/metadata\.delete\(input\.name\)/);
});

test('upload retries reuse the same object path and completed reference',()=>{
  assert.match(component,/useRef<WeakMap<File,Map<string,UploadRecord>>>/);
  assert.match(component,/upload\.reference\?\?await uploadDirect/);
  assert.match(component,/upload\.reference=reference/);
  assert.match(component,/lookupError\|\|data\?\.size!==file\.size/);
  assert.match(component,/if\(submitting\.current\)return/);
});

test('upload completion waits for a successful database result and never catches a framework redirect',()=>{
  assert.match(component,/const result=await action\(metadata\)/);
  assert.match(component,/if\(!result\?\.ok\)throw new Error/);
  assert.match(component,/router\.push\(result\.href\)/);
  assert.doesNotMatch(component,/NEXT_REDIRECT|redirect\(/);
  for(const path of ['../app/portal/onboarding/actions.ts','../app/portal/onboarding/experience/actions.ts','../app/creator-studio/actions.ts','../app/(public)/creators/apply/actions.ts']){
    const actions=readFileSync(new URL(path,import.meta.url),'utf8');
    assert.match(actions,/ok:true as const/);
    assert.match(actions,/ok:false as const/);
  }
});

test('bucket policy rejects unsupported type, size, empty file, and mismatched extension',async()=>{
  const js=transpileModule(policySource,{compilerOptions:{module:ModuleKind.ESNext,target:ScriptTarget.ES2022}}).outputText;
  const {validateUpload,validateUploadContent}=await import(`data:text/javascript,${encodeURIComponent(js)}`);
  const file=(name,type,size)=>({name,type,size});
  assert.doesNotThrow(()=>validateUpload(file('photo.jpg','image/jpeg',512),'avatars'));
  assert.doesNotThrow(()=>validateUpload(file('identity.pdf','application/pdf',512),'founding-verification-documents'));
  assert.throws(()=>validateUpload(file('identity.pdf','application/pdf',512),'avatars'),/unsupported/);
  assert.throws(()=>validateUpload(file('fake.jpg','image/png',512),'avatars'),/extension/);
  assert.throws(()=>validateUpload(file('empty.jpg','image/jpeg',0),'avatars'),/between/);
  assert.throws(()=>validateUpload(file('large.pdf','application/pdf',11*1024*1024),'founding-verification-documents'),/between/);
  assert.throws(()=>validateUpload(file('photo.jpg','image/jpeg',512),'other-bucket'),/destination/);
  await assert.doesNotReject(()=>validateUploadContent(new File([new Uint8Array([0xff,0xd8,0xff,0x00])],'photo.jpg',{type:'image/jpeg'})));
  await assert.rejects(()=>validateUploadContent(new File(['not an image'],'photo.jpg',{type:'image/jpeg'})),/content/);
});
