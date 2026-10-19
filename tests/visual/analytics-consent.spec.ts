import {expect,test} from "@playwright/test";

test("GA tag is withheld until opt-in, then receives one canonical path-only page view",async({page})=>{
  const tagRequests:string[]=[];
  await page.route("https://www.googletagmanager.com/gtag/js**",async route=>{
    tagRequests.push(route.request().url());
    await route.fulfill({status:200,contentType:"application/javascript",body:"/* Google tag mocked for privacy-safe browser verification */"});
  });
  await page.goto("/legal/privacy?email=private%40example.com&token=not-for-analytics",{waitUntil:"networkidle"});
  await expect(page.getByRole("button",{name:"Reject optional analytics"})).toBeVisible();
  expect(tagRequests).toHaveLength(0);
  await page.getByRole("button",{name:"Allow analytics"}).click();
  await expect.poll(()=>tagRequests.length).toBe(1);
  await expect.poll(async()=>page.evaluate(()=>window.__ramahAnalyticsReady===true)).toBe(true);
  const dataLayer=await page.evaluate(()=>Array.from(window.dataLayer??[]).map(item=>Array.from(item)));
  const pageViews=dataLayer.filter(item=>item[0]==="event"&&item[1]==="page_view");
  expect(pageViews).toHaveLength(1);
  const params=pageViews[0]?.[2] as Record<string,string>;
  expect(params.page_location).toBe("https://founding.ramahdigital.online/legal/privacy");
  expect(JSON.stringify(dataLayer)).not.toContain("private@example.com");
  expect(JSON.stringify(dataLayer)).not.toContain("token=not-for-analytics");
  await page.getByRole("navigation",{name:"Footer"}).getByRole("link",{name:"Founding Era",exact:true}).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(async()=>page.evaluate(()=>Array.from(window.dataLayer??[]).filter(item=>Array.from(item)[0]==="event"&&Array.from(item)[1]==="page_view").length)).toBe(2);
  expect(tagRequests).toHaveLength(1);
});

test("rejecting analytics keeps the GA script unloaded on subsequent navigation",async({page})=>{
  const tagRequests:string[]=[];
  await page.route("https://www.googletagmanager.com/gtag/js**",async route=>{tagRequests.push(route.request().url());await route.fulfill({status:200,contentType:"application/javascript",body:""})});
  await page.goto("/",{waitUntil:"networkidle"});
  await page.getByRole("button",{name:"Reject optional analytics"}).click();
  await page.goto("/founding-era/travelers",{waitUntil:"networkidle"});
  await expect(page.getByRole("button",{name:"Privacy preferences"})).toBeVisible();
  expect(tagRequests).toHaveLength(0);
});
