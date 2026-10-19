import {test,expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';

test.skip(process.env.LIVE_UPLOAD_PRODUCTION!=='1','Run explicitly against the authorized production project.');
test.use({trace:'off',screenshot:'off',video:'off'});
test.setTimeout(180_000);

test('synthetic Traveler media persists through the live website and private documents stay owner-scoped',async({page})=>{
  const url=process.env.SUPABASE_URL??'';
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY??'';
  const anonKey=process.env.SUPABASE_ANON_KEY??'';
  if(!url.includes('ugolslqisiwzxexgbnbp.supabase.co')||!serviceKey||!anonKey)throw new Error('Expected production Supabase configuration is unavailable');
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const password=`Qa-${randomUUID()}!`;
  const email=`codex-upload-${randomUUID()}@example.invalid`;
  const otherEmail=`codex-upload-${randomUUID()}@example.invalid`;
  const userIds:string[]=[];
  const objects:{bucket:string;path:string}[]=[];
  try{
    console.log('Synthetic upload check: creating isolated accounts');
    for(const address of [email,otherEmail]){
      const {data,error}=await admin.auth.admin.createUser({email:address,password,email_confirm:true,user_metadata:{role:'traveler',full_name:'Synthetic Upload QA'}});
      if(error||!data.user)throw error??new Error('Synthetic account creation failed');
      userIds.push(data.user.id);
      const {error:profileError}=await admin.from('profiles').upsert({id:data.user.id,email:address,full_name:'Synthetic Upload QA',role:'traveler'},{onConflict:'id'});
      if(profileError)throw profileError;
    }
    console.log('Synthetic upload check: signing in on official domain');
    await page.goto('/auth/sign-in?next=/portal/onboarding');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button',{name:/enter your portal/i}).click();
    await expect(page).toHaveURL(/\/portal\/onboarding/);
    const photo=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAUGB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAbN/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9k=', 'base64');
    console.log('Synthetic upload check: selecting and saving two images');
    await page.locator('input[data-upload-output="avatarUrl"]').setInputFiles({name:'qa-avatar.jpg',mimeType:'image/jpeg',buffer:photo});
    await page.locator('input[data-upload-output="profileCoverUrl"]').setInputFiles({name:'qa-cover.jpg',mimeType:'image/jpeg',buffer:photo});
    await page.locator('input[name="fullName"]').fill('Synthetic Upload QA');
    await page.locator('input[name="country"]').fill('Kenya');
    await page.locator('input[name="city"]').fill('Nairobi');
    await page.locator('form:has(input[data-upload-output="avatarUrl"]) button[type="submit"]').click();
    await expect(page).toHaveURL(/notice=Profile(?:%20|\+)saved/,{timeout:60_000});
    await expect(page.getByText('Profile saved')).toBeVisible();
    console.log('Synthetic upload check: verifying profile and Storage references');
    const {data:profile,error:profileError}=await admin.from('profiles').select('avatar_url,cover_url,full_name,location').eq('id',userIds[0]).single();
    if(profileError)throw profileError;
    expect(profile.full_name).toBe('Synthetic Upload QA');
    expect(profile.location).toBe('Nairobi');
    for(const [bucket,publicUrl] of [['avatars',profile.avatar_url],['covers',profile.cover_url]] as const){
      expect(publicUrl).toContain(`/storage/v1/object/public/${bucket}/${userIds[0]}/`);
      const path=new URL(publicUrl).pathname.split(`/object/public/${bucket}/`)[1];
      objects.push({bucket,path});
      const {data,error}=await admin.storage.from(bucket).info(path);
      expect(error).toBeNull();expect(data?.size).toBe(photo.length);
    }
    await page.reload();
    await expect(page.locator('img[src*="/storage/v1/object/public/avatars/"]')).toBeVisible();
    const owner=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const other=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const ownerSignIn=await owner.auth.signInWithPassword({email,password});
    const otherSignIn=await other.auth.signInWithPassword({email:otherEmail,password});
    if(ownerSignIn.error||otherSignIn.error)throw ownerSignIn.error??otherSignIn.error;
    console.log('Synthetic upload check: verifying private document isolation');
    const privatePath=`${userIds[0]}/businessDocumentPath/${randomUUID()}-qa.pdf`;
    const pdf=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF');
    const uploaded=await owner.storage.from('founding-verification-documents').upload(privatePath,pdf,{contentType:'application/pdf',upsert:false});
    if(uploaded.error)throw uploaded.error;
    objects.push({bucket:'founding-verification-documents',path:privatePath});
    const ownerRead=await owner.storage.from('founding-verification-documents').download(privatePath);
    expect(ownerRead.error).toBeNull();
    const otherRead=await other.storage.from('founding-verification-documents').download(privatePath);
    expect(otherRead.error).not.toBeNull();
  }finally{
    console.log('Synthetic upload check: cleaning created accounts and objects');
    for(const object of objects)await admin.storage.from(object.bucket).remove([object.path]);
    for(const id of userIds)await admin.auth.admin.deleteUser(id);
  }
});
