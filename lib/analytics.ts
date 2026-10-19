export type RamahAnalyticsEvent =
  | "view_membership_tier"
  | "select_membership_tier"
  | "begin_signup"
  | "sign_up"
  | "email_verification_success"
  | "begin_onboarding"
  | "onboarding_step_completed"
  | "application_submitted"
  | "application_approved"
  | "contact_cta_click"
  | "partner_cta_click"
  | "creator_cta_click";

export type ApplicantCategory = "traveler" | "stay_partner" | "experience_partner" | "creator";
export type AnalyticsParams = Partial<{
  applicant_category: ApplicantCategory;
  membership_tier: string;
  onboarding_step: string;
  page_section: string;
}>;

export const ANALYTICS_CONSENT_KEY = "ramah.analytics.consent.v1";
const safeTiers=new Set(["explore","voyager","community","community_host","founding","founding_host","signature","signature_host","prestige","prestige_host","legacy","legacy_host","creator_plus","creator_pro"]);
const safeSteps=new Set(["profile","property","rooms","payment-methods","discover","review","business","experience","availability","experience-deal","launch-video"]);

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    __ramahAnalyticsReady?: boolean;
    __ramahPendingEvents?: {event:RamahAnalyticsEvent;params:AnalyticsParams}[];
  }
}

export function trackRamahEvent(event: RamahAnalyticsEvent, params: AnalyticsParams = {}) {
  if (typeof window === "undefined" || window.localStorage.getItem(ANALYTICS_CONSENT_KEY) !== "granted") return;
  if(!window.__ramahAnalyticsReady||!window.gtag){window.__ramahPendingEvents=window.__ramahPendingEvents??[];window.__ramahPendingEvents.push({event,params});return}
  const path=safeAnalyticsPath(window.location.pathname);
  const safe: Record<string, string> = {page_path:path,page_location:safeCanonicalPageLocation(path),page_title:"Ramah Digital",page_referrer:"https://founding.ramahdigital.online"};
  if (params.applicant_category) safe.applicant_category = params.applicant_category;
  if (params.membership_tier && safeTiers.has(params.membership_tier)) safe.membership_tier = params.membership_tier;
  if (params.onboarding_step && safeSteps.has(params.onboarding_step)) safe.onboarding_step = params.onboarding_step;
  if (params.page_section && /^[a-z0-9_-]{1,40}$/i.test(params.page_section)) safe.page_section = params.page_section;
  window.gtag("event", event, safe);
}

export function safeCanonicalPageLocation(pathname: string) {
  const path = safeAnalyticsPath(pathname);
  return `https://founding.ramahdigital.online${path}`;
}

export function safeAnalyticsPath(pathname:string){
  const path=pathname.startsWith("/")?pathname:`/${pathname}`;
  if(/^\/(founders|creators|circles)\/[^/]+/.test(path))return path.startsWith("/founders/")?"/founders/:slug":path.startsWith("/creators/")?"/creators/:slug":"/circles/:slug";
  if(path.startsWith("/founding-admin/"))return "/founding-admin";
  if(path.startsWith("/portal/"))return "/portal";
  if(path.startsWith("/creator-studio/"))return "/creator-studio";
  if(path.startsWith("/auth/"))return path.split("/").slice(0,3).join("/");
  if(path.startsWith("/verify/"))return "/verify";
  return path;
}
