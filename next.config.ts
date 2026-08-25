import type { NextConfig } from "next";

const securityHeaders = [
  {key:"Content-Security-Policy",value:"default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; media-src 'self' blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:; upgrade-insecure-requests"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(self), browsing-topics=()"},
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Cross-Origin-Opener-Policy",value:"same-origin"},
  {key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"},
];

const config: NextConfig = {
  turbopack:{root:process.cwd()},
  images:{formats:["image/avif","image/webp"],deviceSizes:[390,768,1024,1440,1920],qualities:[75,88]},
  experimental:{optimizePackageImports:["@supabase/supabase-js"]},
  async headers(){return [{source:"/(.*)",headers:securityHeaders}]},
};
export default config;
