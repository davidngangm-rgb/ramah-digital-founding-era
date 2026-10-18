import type {Metadata,Viewport} from "next";
import "@/styles/globals.css";
import "@/styles/ramah-web.css";
import "@/styles/rebuild.css";
import "@/styles/master.css";
import "@/styles/founding-platform.css";
import {site} from "@/lib/site";

export const metadata:Metadata={
  metadataBase:new URL(site.url),
  title:{default:"Ramah Digital",template:"%s | Ramah"},
  description:site.description,
  alternates:{canonical:"/"},
  openGraph:{type:"website",siteName:"Ramah Digital",title:"Your Home. Your World. Your Journey.",description:site.description,images:[{url:"/images/founding-era/hero.webp",width:1179,height:775,alt:"A tropical coastal destination seen from above"}]},
  twitter:{card:"summary_large_image",title:"Ramah Digital",description:site.description,images:["/images/founding-era/hero.webp"]},
  robots:{index:true,follow:true}
};
export const viewport:Viewport={themeColor:"#ffffff",colorScheme:"light"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a>{children}</body></html>}
