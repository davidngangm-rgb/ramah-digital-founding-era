import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const component=readFileSync(new URL('../components/DirectUploadForm.tsx',import.meta.url),'utf8');
const snapshot=readFileSync(new URL('../lib/upload-submission.ts',import.meta.url),'utf8');

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
