"use client";

import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {publicNav,secondaryNav} from "@/lib/site";

export function Header({overlay=false}:{overlay?:boolean}){
  const [mobileOpen,setMobileOpen]=useState(false);

  return <header className={`rd-header${overlay?" rd-header--overlay":""}`}>
    <Link className="rd-brand" href="/" aria-label="Ramah Digital home">
      <Image src="/ramah-app-icon.png" width={40} height={40} priority alt=""/>
      <span><b>RAMAH</b><small>DIGITAL</small></span>
    </Link>
    <nav className="rd-nav" aria-label="Primary navigation">
      {publicNav.slice(1).map(([label,href])=><Link key={href} href={href}>{label}</Link>)}
    </nav>
    <div className="rd-header-actions">
      <Link className="rd-text-link" href="/auth/sign-in">Sign in</Link>
      <Link className="rd-button rd-button--small" href="/">Founding Era</Link>
    </div>
    <div className="rd-mobile-menu">
      <button
        type="button"
        className="rd-mobile-menu__trigger"
        aria-label={mobileOpen?"Close navigation":"Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="rd-mobile-navigation"
        onClick={()=>setMobileOpen((open)=>!open)}
      ><span/><span/><span/></button>
      <div id="rd-mobile-navigation" hidden={!mobileOpen}><b>Founding Era</b>{publicNav.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}<span>Account and help</span><Link href="/auth/sign-in">Sign in</Link>{secondaryNav.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</div>
    </div>
  </header>;
}
