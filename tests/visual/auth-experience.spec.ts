import {expect,test} from '@playwright/test';

test('email verification has the real brand, six-digit OTP affordance, and compact responsive layout',async({page})=>{
  await page.goto('/auth/verify-email?email=traveler%40example.test&cooldown=1');
  await expect(page.getByRole('heading',{name:'Verify your email.'})).toBeVisible();
  const logo=page.getByRole('link',{name:'Ramah Digital home'}).locator('img');
  await expect(logo).toBeVisible();
  await expect.poll(async()=>logo.evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const code=page.getByLabel('Six-digit verification code');
  await code.fill('123456');
  await expect(code).toHaveValue('123456');
  for(const [index,digit] of ['1','2','3','4','5','6'].entries()){
    await expect(page.locator('.otp-code__slot').nth(index)).toHaveText(digit);
  }
  await expect(page.getByRole('button',{name:'Verify and continue'})).toBeVisible();
  await expect(page.getByRole('button',{name:/Send a new code in/})).toBeDisabled();
  const panel=page.locator('.auth-page__panel');
  const bounds=await panel.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y).toBeLessThan(260);
  expect(bounds!.width).toBeGreaterThan(280);
  expect(bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('authentication entry pages use the shared Ramah logo and branded pending action button',async({page})=>{
  for(const route of ['/auth/sign-in','/auth/sign-up?type=traveler&tier=explore','/auth/forgot-password','/auth/reset-password']){
    await page.goto(route);
    await expect(page.getByRole('link',{name:'Ramah Digital home'}).locator('img')).toBeVisible();
    await expect(page.locator('.auth-page .action-submit').first()).toBeVisible();
  }
});
