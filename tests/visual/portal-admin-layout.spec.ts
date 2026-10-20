import {expect,test} from '@playwright/test';

test('sign-in labels, fields and primary action form an aligned vertical form',async({page})=>{
  await page.goto('/auth/sign-in');
  const email=page.getByLabel('Email',{exact:true}),password=page.getByLabel('Password',{exact:true}),submit=page.getByRole('button',{name:'Enter your portal'});
  await expect(email).toBeVisible();await expect(password).toBeVisible();await expect(submit).toBeVisible();
  const [emailBox,passwordBox,submitBox]=await Promise.all([email.boundingBox(),password.boundingBox(),submit.boundingBox()]);
  expect(emailBox).not.toBeNull();expect(passwordBox).not.toBeNull();expect(submitBox).not.toBeNull();
  expect(Math.abs(emailBox!.x-passwordBox!.x)).toBeLessThan(2);expect(Math.abs(passwordBox!.x-submitBox!.x)).toBeLessThan(2);
  expect(Math.abs(emailBox!.width-passwordBox!.width)).toBeLessThan(2);expect(Math.abs(passwordBox!.width-submitBox!.width)).toBeLessThan(2);
  expect(passwordBox!.y).toBeGreaterThan(emailBox!.y+emailBox!.height);
  await expect(page.getByRole('button',{name:'Show password'})).toBeVisible();
});

test('private portal and Founder Admin routes redirect unauthenticated visitors to sign in',async({page})=>{
  for(const route of ['/portal','/founding-admin','/founding-admin/documents']){
    await page.goto(route);
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await expect(page.getByRole('heading',{name:'Return to your place in the story.'})).toBeVisible();
  }
});

test('authenticated workspace navigation and controls stay within narrow viewports',async({page})=>{
  await page.goto('/auth/sign-in');
  await expect(page.getByRole('link',{name:'Ramah Digital home'})).toBeVisible();
  const dimensions=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
});
