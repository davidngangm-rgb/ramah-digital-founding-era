import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {transpileModule,ModuleKind,ScriptTarget} from 'typescript';

const source=readFileSync(join(process.cwd(),'lib/upload-submission.ts'),'utf8');
const moduleSource=transpileModule(source,{compilerOptions:{module:ModuleKind.ESNext,target:ScriptTarget.ES2022}}).outputText;

test('browser reproduces the original FormData error, then captures the real form and files',async({page})=>{
  await page.goto('about:blank');
  const result=await page.evaluate(async(code)=>{
    let oldError='';
    try{new FormData(null as unknown as HTMLFormElement)}catch(error){oldError=String(error)}
    const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
    try{
      const {captureUploadSubmission}=await import(/* webpackIgnore: true */ url);
      const form=document.createElement('form');
      form.innerHTML='<input name="fullName" value="Amina"><input name="avatar" type="file" data-upload-bucket="avatars" data-upload-output="avatarUrl"><input name="cover" type="file" data-upload-bucket="covers" data-upload-output="profileCoverUrl">';
      document.body.append(form);
      const inputs=form.querySelectorAll<HTMLInputElement>('input[type="file"]');
      for(const [index,input] of Array.from(inputs).entries()){
        const transfer=new DataTransfer();
        transfer.items.add(new File([`photo-${index}`],`photo-${index}.jpg`,{type:'image/jpeg'}));
        input.files=transfer.files;
      }
      const captured=captureUploadSubmission(form);
      await Promise.resolve();
      return {oldError,name:captured.metadata.get('fullName'),fileBody:captured.metadata.has('avatar')||captured.metadata.has('cover'),files:captured.selections.map((item:{files:File[]})=>item.files[0]?.name)};
    }finally{URL.revokeObjectURL(url)}
  },moduleSource);
  expect(result.oldError).toContain("Failed to construct 'FormData'");
  expect(result.name).toBe('Amina');
  expect(result.fileBody).toBe(false);
  expect(result.files).toEqual(['photo-0.jpg','photo-1.jpg']);
});
