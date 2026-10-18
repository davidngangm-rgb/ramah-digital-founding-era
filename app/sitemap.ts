import type {MetadataRoute} from "next";
import {site} from "@/lib/site";
import {getCreators,getCircles,getFounders} from "@/lib/supabase/queries";

export const dynamic="force-dynamic";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const pages=["","/travelers","/stay-partners","/experience-partners","/story","/creators","/founding-era","/ramah-circle","/circles","/contact","/founding-travelers","/founding-hosts","/partners","/trust","/how-it-works","/founders","/faq","/legal/privacy","/legal/terms"];
  const [founders,creators,circles]=await Promise.all([getFounders(100),getCreators(100),getCircles(100)]);
  const publicPages:MetadataRoute.Sitemap=pages.map(path=>({url:`${site.url}${path}`,changeFrequency:path===""?"daily":"weekly",priority:path===""?1:.7}));
  return [...publicPages,...founders.map(founder=>({url:`${site.url}/founders/${founder.public_slug}`,changeFrequency:"weekly" as const,priority:.6})),...creators.map(creator=>({url:`${site.url}/creators/${creator.public_slug}`,changeFrequency:"weekly" as const,priority:.7})),...circles.map(circle=>({url:`${site.url}/circles/${circle.slug}`,changeFrequency:"weekly" as const,priority:.8}))];
}
