import {expect,test,type Page} from "@playwright/test";

test.setTimeout(60_000);

const primarySurfaces=[
  {name:"home",route:"/",heading:"Choose your Founding membership."},
  {name:"traveler-tiers",route:"/founding-era/travelers",heading:"Explore Ramah from the beginning."},
  {name:"stay-partner-tiers",route:"/founding-era/partners?vertical=stay",heading:"Put your stay in front of people ready to discover it."},
  {name:"experience-partner-tiers",route:"/founding-era/partners?vertical=experience",heading:"Make a real experience easier to find and book."},
  {name:"creator-tiers",route:"/founding-era/creators",heading:"Build a credible Creator presence on Ramah."},
  {name:"traveler-account",route:"/auth/sign-up?type=traveler&tier=explore",heading:"Create your Ramah account."},
  {name:"stay-partner-account",route:"/auth/sign-up?type=host&tier=community&vertical=stay",heading:"Create your Ramah account."},
  {name:"experience-partner-account",route:"/auth/sign-up?type=host&tier=community&vertical=experience",heading:"Create your Ramah account."},
  {name:"creator-account",route:"/auth/sign-up?intent=creator&tier=creator_plus",heading:"Create your account, then apply."}
  ,{name:"sign-in",route:"/auth/sign-in",heading:"Return to your place in the story."}
  ,{name:"verify-email",route:"/auth/verify-email?email=test%40example.com&next=%2Fportal",heading:"Verify your email."}
  ,{name:"forgot-password",route:"/auth/forgot-password",heading:"Reset your password."}
  ,{name:"verify-recovery",route:"/auth/verify-recovery?email=test%40example.com",heading:"Enter your recovery code."}
  ,{name:"reset-password",route:"/auth/reset-password",heading:"Choose a new password."}
] as const;

async function expectHealthyPage(page:Page){
  await expect(page.locator("#main")).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const brokenImages=await page.locator("img").evaluateAll(images=>images.filter(image=>{
    const element=image as HTMLImageElement;
    return element.complete&&element.naturalWidth===0;
  }).map(image=>image.getAttribute("src")));
  expect(brokenImages).toEqual([]);
}

for(const surface of primarySurfaces){
  test(`${surface.name} renders as the Founding Era platform`,async({page},testInfo)=>{
    const consoleErrors:string[]=[];
    page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text());});
    await page.goto(surface.route,{waitUntil:"networkidle"});
    await expect(page.getByRole("heading",{level:1,name:surface.heading})).toBeVisible();
    await expectHealthyPage(page);
    expect(consoleErrors).toEqual([]);
    await page.screenshot({path:testInfo.outputPath(`${surface.name}-full.png`),fullPage:true,animations:"disabled"});
  });
}

test("retired marketing routes redirect deliberately",async({page})=>{
  const redirects=[
    ["/founding-era","/"],
    ["/travelers","/founding-era/travelers"],
    ["/stay-partners","/founding-era/partners"],
    ["/experience-partners","/founding-era/partners"],
    ["/creators","/founding-era/creators"],
    ["/partners","/founding-era/partners"],
    ["/story","/"],
    ["/ramah-circle","/"]
  ] as const;
  for(const [route,destination] of redirects){
    await page.goto(route,{waitUntil:"domcontentloaded"});
    expect(new URL(page.url()).pathname).toBe(destination);
    await expect(page.locator("#main")).toBeVisible();
  }
});

test("allocations are presented as limits, not fabricated availability",async({page})=>{
  await page.goto("/",{waitUntil:"networkidle"});
  await expect(page.getByText("Program limits, not live availability.",{exact:true})).toBeVisible();
  await expect(page.getByText("600 Travelers",{exact:true})).toBeVisible();
  await expect(page.getByText(/300 Founding Partners shared across Stay and Experience/)).toBeVisible();
  await expect(page.getByText("100 Creators",{exact:true})).toBeVisible();
});

test("the public landing uses exactly the five approved editorial photographs",async({page})=>{
  await page.goto("/",{waitUntil:"networkidle"});
  const sources=await page.locator("main img").evaluateAll(images=>images.map(image=>{
    const element=image as HTMLImageElement;
    return element.currentSrc||element.getAttribute("src")||"";
  }));
  expect(sources).toHaveLength(5);
  for(const name of ["hero","travelers","stay-partners","experience-partners","creators"]){
    expect(sources.some(source=>source.includes(name))).toBeTruthy();
  }
});

test("Creator recruitment is free and deferred",async({page})=>{
  await page.goto("/auth/sign-up?intent=creator&tier=creator_pro",{waitUntil:"domcontentloaded"});
  await expect(page.getByText("Free to apply",{exact:true})).toBeVisible();
  await expect(page.getByText("Your intended Plus or Pro tier is recorded before review",{exact:true})).toBeVisible();
  await expect(page.locator('input[name="type"]')).toHaveValue("creator");
  await expect(page.locator('input[name="tier"]')).toHaveValue("creator_pro");
});

test("email OTP screen offers a six-digit entry and a guarded resend action",async({page})=>{
  await page.goto("/auth/verify-email?email=test%40example.com&next=%2Fportal%2Fonboarding",{waitUntil:"domcontentloaded"});
  const code=page.getByLabel("Six-digit verification code");
  await expect(code).toHaveAttribute("pattern","[0-9]{6}");
  await expect(code).toHaveAttribute("autocomplete","one-time-code");
  await expect(page.getByRole("button",{name:"Verify and continue"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Send a new code"})).toBeEnabled();
  await expect(page.getByRole("link",{name:"Sign in"})).toBeVisible();
});

test("mobile menu is keyboard reachable",async({page},testInfo)=>{
  test.skip(testInfo.project.name.startsWith("desktop"),"Mobile navigation is intentionally hidden on desktop.");
  await page.goto("/",{waitUntil:"networkidle"});
  const menu=page.locator(".rd-mobile-menu__trigger");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded","true");
  await expect(page.locator(".rd-mobile-menu a").first()).toBeVisible();
});

test("private applicant and staff routes redirect unauthenticated visitors",async({page})=>{
  for(const route of ["/portal","/portal/onboarding","/founding-admin","/creator-studio","/creators/apply"]){
    await page.goto(route,{waitUntil:"domcontentloaded"});
    const current=new URL(page.url());
    expect(current.pathname).toBe("/auth/sign-in");
    expect(current.searchParams.get("next")).toBe(route);
  }
});
