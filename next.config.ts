import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const scriptPolicy = isDevelopment
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const securityHeaders = [
  {key:"Content-Security-Policy",value:`default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; ${scriptPolicy} https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com; media-src 'self' blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com; font-src 'self' data:`},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(self), browsing-topics=()"},
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Cross-Origin-Opener-Policy",value:"same-origin"},
  {key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"},
];

const config: NextConfig = {
  turbopack:{root:process.cwd()},
  allowedDevOrigins:["127.0.0.1","localhost"],
  images:{formats:["image/avif","image/webp"],deviceSizes:[390,768,1024,1440,1920],qualities:[75,88]},
  experimental:{optimizePackageImports:["@supabase/supabase-js"]},
  async redirects(){return [
    {source:"/travelers",destination:"/founding-era/travelers",permanent:false},
    {source:"/stay-partners",destination:"/founding-era/partners?vertical=stay",permanent:false},
    {source:"/experience-partners",destination:"/founding-era/partners?vertical=experience",permanent:false},
    {source:"/creators",destination:"/founding-era/creators",permanent:false},
    {source:"/story",destination:"/",permanent:false},
    {source:"/founding-era",destination:"/",permanent:false},
    {source:"/ramah-circle",destination:"/",permanent:false},
    {source:"/partners",destination:"/founding-era/partners",permanent:false},
    {source:"/founding-travelers",destination:"/founding-era/travelers",permanent:false},
    {source:"/founding-hosts",destination:"/founding-era/partners",permanent:false},
    {source:"/how-it-works",destination:"/#founding-pathways",permanent:false},
    {source:"/faq",destination:"/contact",permanent:false},
  ]},
  async headers(){return [{source:"/(.*)",headers:securityHeaders}]},
};
export default config;
