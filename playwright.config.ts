import {defineConfig,devices} from "@playwright/test";

const externalBaseUrl=process.env.VISUAL_BASE_URL;

export default defineConfig({
  testDir:"./tests/visual",
  outputDir:".artifacts/playwright-results",
  fullyParallel:false,
  workers:2,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?1:0,
  reporter:[["list"],["html",{outputFolder:".artifacts/playwright-report",open:"never"}]],
  use:{baseURL:externalBaseUrl??"http://127.0.0.1:3100",colorScheme:"light",reducedMotion:"reduce",trace:"retain-on-failure",screenshot:"only-on-failure",navigationTimeout:60_000},
  webServer:externalBaseUrl?undefined:{command:"npm run start -- --hostname 127.0.0.1 --port 3100",url:"http://127.0.0.1:3100",reuseExistingServer:false,timeout:120_000},
  projects:[
    {name:"desktop-1440",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:1000}}},
    {name:"desktop-1280",use:{...devices["Desktop Chrome"],viewport:{width:1280,height:900}}},
    {name:"tablet-768",use:{...devices["Desktop Chrome"],viewport:{width:768,height:1024}}},
    {name:"small-android",use:{...devices["Pixel 5"]}},
    {name:"iphone",use:{...devices["iPhone 13"],browserName:"chromium"}}
  ]
});
