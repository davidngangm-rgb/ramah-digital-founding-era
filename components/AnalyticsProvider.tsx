"use client";

import Script from "next/script";
import {usePathname} from "next/navigation";
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore} from "react";
import {ANALYTICS_CONSENT_KEY, safeCanonicalPageLocation, trackRamahEvent, type AnalyticsParams, type RamahAnalyticsEvent} from "@/lib/analytics";

type Consent = "unknown" | "granted" | "denied";
type AnalyticsContextValue = {consent: Consent; track: (event: RamahAnalyticsEvent, params?: AnalyticsParams) => void; manage: () => void};
const AnalyticsContext = createContext<AnalyticsContextValue>({consent:"unknown",track:()=>{},manage:()=>{}});
const measurementId = /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID??"")?process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID:undefined;
const subscribeConsent=(callback:()=>void)=>{window.addEventListener("storage",callback);window.addEventListener("ramah:analytics-consent",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("ramah:analytics-consent",callback)}};
const getConsent=():Consent=>{const value=window.localStorage.getItem(ANALYTICS_CONSENT_KEY);return value==="granted"||value==="denied"?value:"unknown"};
const getServerConsent=():Consent=>"unknown";

export function AnalyticsProvider({children}:{children:React.ReactNode}) {
  const pathname = usePathname() || "/";
  const consent=useSyncExternalStore(subscribeConsent,getConsent,getServerConsent);
  const [showPreferences,setShowPreferences] = useState(false);
  const [ready,setReady] = useState(false);
  const lastPageview=useRef<string|null>(null);

  useEffect(()=>{
    const manage=()=>setShowPreferences(true);
    window.addEventListener("ramah:manage-analytics-consent",manage);
    return()=>window.removeEventListener("ramah:manage-analytics-consent",manage);
  },[]);

  useEffect(()=>{
    if(!ready||consent!=="granted"||!measurementId)return;
    if(lastPageview.current===pathname)return;
    lastPageview.current=pathname;
    window.gtag?.("consent","update",{analytics_storage:"granted",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
    const safePath=new URL(safeCanonicalPageLocation(pathname)).pathname;
    window.gtag?.("event","page_view",{page_path:safePath,page_location:safeCanonicalPageLocation(safePath),page_title:"Ramah Digital",page_referrer:"https://founding.ramahdigital.online"});
  },[pathname,ready,consent]);

  useEffect(()=>{
    if(consent!=="granted"||!ready)return;
    const params=new URLSearchParams(window.location.search);
    const category=pathname==="/creators/apply"?"creator":pathname.startsWith("/portal/onboarding/experience")?"experience_partner":pathname==="/portal/onboarding"?(params.get("vertical")==="experience"?"experience_partner":params.get("type")==="host"?"stay_partner":params.get("type")==="traveler"?"traveler":undefined):undefined;
    if(!category&&pathname!=="/portal/onboarding")return;
    const key=`ramah.analytics.begin-onboarding.${pathname}.${category??"category-not-in-url"}`;
    if(window.sessionStorage.getItem(key)==="1")return;
    window.sessionStorage.setItem(key,"1");trackRamahEvent("begin_onboarding",{applicant_category:category});
  },[pathname,consent,ready]);

  useEffect(()=>{
    if(consent!=="granted"||!ready)return;
    const links=Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/auth/sign-up"]'));
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting||!(entry.target instanceof HTMLAnchorElement))return;
      const url=new URL(entry.target.href,window.location.origin),params=url.searchParams,type=params.get("type"),intent=params.get("intent");
      const category=intent==="creator"?"creator":type==="traveler"?"traveler":type==="host"?(params.get("vertical")==="experience"?"experience_partner":"stay_partner"):undefined;
      const tier=params.get("tier");if(!category||!tier)return;
      const key=`ramah.analytics.view-tier.${category}.${tier}`;
      if(window.sessionStorage.getItem(key)==="1")return;
      window.sessionStorage.setItem(key,"1");trackRamahEvent("view_membership_tier",{applicant_category:category,membership_tier:tier});
    }),{threshold:0.25});
    links.forEach(link=>observer.observe(link));return()=>observer.disconnect();
  },[pathname,consent,ready]);

  useEffect(()=>{
    if(consent!=="granted"||!ready)return;
    const params=new URLSearchParams(window.location.search);
    const event=params.get("rd_event");
    if(event!=="sign_up")return;
    const category=params.get("rd_category");
    const allowedCategory=category==="traveler"||category==="stay_partner"||category==="experience_partner"||category==="creator"?category:undefined;
    const key=`ramah.analytics.once.${event}.${pathname}.${allowedCategory??"account"}`;
    if(window.sessionStorage.getItem(key)==="1")return;
    window.sessionStorage.setItem(key,"1");
    trackRamahEvent(event,{applicant_category:allowedCategory});
    if(params.get("rd_verified")==="1")trackRamahEvent("email_verification_success",{applicant_category:allowedCategory});
    params.delete("rd_event");params.delete("rd_category");params.delete("rd_verified");
    const cleaned=`${window.location.pathname}${params.size?`?${params.toString()}`:""}${window.location.hash}`;
    window.history.replaceState(window.history.state,"",cleaned);
  },[consent,pathname,ready]);

  const choose=useCallback((value:"granted"|"denied")=>{
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY,value);
    window.dispatchEvent(new Event("ramah:analytics-consent"));setShowPreferences(false);
    if(value==="denied"){
      window.gtag?.("consent","update",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
      for(const name of document.cookie.split(";").map(cookie=>cookie.split("=")[0]?.trim()??""))if(name==="_ga"||name.startsWith("_ga_")){document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;document.cookie=`${name}=; Max-Age=0; path=/; domain=.ramahdigital.online; SameSite=Lax`;}
      setReady(false);window.__ramahAnalyticsReady=false;window.__ramahPendingEvents=[];lastPageview.current=null;
    }
  },[]);
  const track=useCallback((event:RamahAnalyticsEvent,params?:AnalyticsParams)=>trackRamahEvent(event,params),[]);
  const value=useMemo(()=>({consent,track,manage:()=>setShowPreferences(true)}),[consent,track]);
  const onClickCapture=(event:React.MouseEvent)=>{
    const target=event.target;
    if(!(target instanceof Element))return;
    const anchor=target.closest("a[href]");
    if(!(anchor instanceof HTMLAnchorElement))return;
    const url=new URL(anchor.href,window.location.origin),section=anchor.closest("section[id]")?.getAttribute("id")??undefined;
    if(url.pathname==="/contact")track("contact_cta_click",{page_section:section});
    if(url.pathname==="/auth/sign-up"){
      const params=url.searchParams,type=params.get("type"),intent=params.get("intent"),tier=params.get("tier")??undefined;
      const category=intent==="creator"?"creator":type==="traveler"?"traveler":type==="host"?(params.get("vertical")==="experience"?"experience_partner":"stay_partner"):undefined;
      if(category){track("select_membership_tier",{applicant_category:category,membership_tier:tier,page_section:section});if(category==="creator")track("creator_cta_click",{applicant_category:category,page_section:section});if(category==="stay_partner"||category==="experience_partner")track("partner_cta_click",{applicant_category:category,page_section:section});}
    }
    if(url.pathname==="/creators/apply"&&url.searchParams.get("tier"))track("select_membership_tier",{applicant_category:"creator",membership_tier:url.searchParams.get("tier")??undefined,page_section:section});
  };

  return <AnalyticsContext.Provider value={value}>
    <div onClickCapture={onClickCapture}>{children}</div>
    {measurementId&&consent==="granted"&&<><Script id="ramah-ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});`}}/><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" onReady={()=>{window.__ramahAnalyticsReady=true;setReady(true);for(const pending of window.__ramahPendingEvents??[])trackRamahEvent(pending.event,pending.params);window.__ramahPendingEvents=[]}}/></>}
    {measurementId&&consent==="unknown"&&<aside className="analytics-consent" aria-label="Analytics preferences"><div><strong>Help us improve Ramah</strong><p>Optional Google Analytics helps us understand site visits and Founding Era engagement. It is off unless you choose to allow it. No advertising personalization is enabled.</p><a href="/legal/privacy">Privacy details</a></div><div className="analytics-consent__actions"><button type="button" onClick={()=>choose("denied")}>Reject optional analytics</button><button type="button" className="analytics-consent__accept" onClick={()=>choose("granted")}>Allow analytics</button></div></aside>}
    {measurementId&&consent!=="unknown"&&<button type="button" className="analytics-manage" onClick={()=>setShowPreferences(true)}>Privacy preferences</button>}
    {showPreferences&&<div className="analytics-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setShowPreferences(false)}}><section className="analytics-modal" role="dialog" aria-modal="true" aria-labelledby="analytics-preferences-title"><h2 id="analytics-preferences-title">Privacy preferences</h2><p>Essential storage supports account and security functions. Optional Google Analytics remains {consent==="granted"?"enabled":"disabled"} unless you choose otherwise. Advertising personalization is disabled.</p><div className="analytics-consent__actions"><button type="button" onClick={()=>choose("denied")}>Reject / withdraw analytics</button><button type="button" className="analytics-consent__accept" onClick={()=>choose("granted")}>Allow analytics</button><button type="button" onClick={()=>setShowPreferences(false)}>Close</button></div></section></div>}
  </AnalyticsContext.Provider>;
}

export function useRamahAnalytics(){return useContext(AnalyticsContext)}

export function OnboardingStartAnalytics({category}:{category:"traveler"|"stay_partner"|"experience_partner"|"creator"}){
  const {consent,track}=useRamahAnalytics();
  useEffect(()=>{if(consent!=="granted")return;const key=`ramah.analytics.begin-onboarding.${category}`;if(window.sessionStorage.getItem(key)==="1")return;window.sessionStorage.setItem(key,"1");track("begin_onboarding",{applicant_category:category});},[category,consent,track]);
  return null;
}

export function ApplicationAnalytics({applicationId,status,category,tier}:{applicationId:string;status:string;category:"traveler"|"stay_partner"|"experience_partner"|"creator";tier:string|null}){
  const {consent,track}=useRamahAnalytics();
  useEffect(()=>{
    if(consent!=="granted"||!applicationId)return;
    if(["pending","under_review","awaiting_payment"].includes(status)){
      const key=`ramah.analytics.application-submitted.${applicationId}`;
      if(window.localStorage.getItem(key)!=="1"){window.localStorage.setItem(key,"1");track("application_submitted",{applicant_category:category,membership_tier:tier??undefined});}
    }
    if(status==="approved"){
      const key=`ramah.analytics.application-approved.${applicationId}`;
      if(window.localStorage.getItem(key)!=="1"){window.localStorage.setItem(key,"1");track("application_approved",{applicant_category:category,membership_tier:tier??undefined});}
    }
  },[applicationId,status,category,tier,consent,track]);
  return null;
}

export function MembershipViewTracker({category,tier}:{category:"traveler"|"stay_partner"|"experience_partner"|"creator";tier:string}){
  const ref=useRef<HTMLSpanElement>(null),{consent,track}=useRamahAnalytics();
  useEffect(()=>{
    const element=ref.current;if(!element||consent!=="granted")return;
    const key=`ramah.analytics.view-tier.${category}.${tier}`;
    if(window.sessionStorage.getItem(key)==="1")return;
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){window.sessionStorage.setItem(key,"1");track("view_membership_tier",{applicant_category:category,membership_tier:tier});observer.disconnect()}},{threshold:0.25});
    observer.observe(element);return()=>observer.disconnect();
  },[category,tier,consent,track]);
  return <span ref={ref} className="analytics-observation-anchor" aria-hidden="true"/>;
}
