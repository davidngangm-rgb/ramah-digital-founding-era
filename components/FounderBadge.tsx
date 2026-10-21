import Image from 'next/image';
import {tierName} from '@/lib/memberships';

type Props={
  founderNumber:string;
  founderType:'travel'|'host'|'creator'|string;
  tierCode?:string|null;
  memberName?:string;
  categoryLabel?:string;
  membershipStatus?:string;
  activatedAt?:string|null;
  compact?:boolean;
};

const badgeCharacter:Record<string,{mark:string;material:string;edition:string}>={
 explore:{mark:'✦',material:'Brushed silver · emerald enamel',edition:'The First Passage'},
 voyager:{mark:'◇',material:'Platinum · sapphire glass',edition:'Beyond the Horizon'},
 community_host:{mark:'⌂',material:'Hospitality steel · warm nickel',edition:'The Open Door'},
 founding_host:{mark:'✧',material:'Polished gold · heritage enamel',edition:'The First Welcome'},
 signature_host:{mark:'S',material:'Black titanium · gold inlay',edition:'The Signature Standard'},
 prestige_host:{mark:'P',material:'Platinum · emerald crystal',edition:'The Grand Arrival'},
 legacy_host:{mark:'L',material:'Obsidian · platinum · 24k gold',edition:'The Legacy Reserve'},
 creator_plus:{mark:'✧',material:'Heritage gold · creator enamel',edition:'The First Voice'},
 creator_pro:{mark:'◇',material:'Obsidian · gold inlay',edition:'The Lasting Influence'},
};

export function FounderBadge({founderNumber,founderType,tierCode,memberName,categoryLabel,membershipStatus='active',activatedAt,compact=false}:Props){
 const tier=tierName(tierCode),character=badgeCharacter[tierCode??'']??{mark:'✦',material:'Ramah heritage metal',edition:'The Founding Era'};
 const category=categoryLabel??(founderType==='travel'?'Founding Traveler':founderType==='creator'?'Founding Creator':'Founding Partner');
 const date=activatedAt?new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(activatedAt)):null;
 return <article className={`founder-credential badge-${tierCode??'default'}${compact?' compact':''}`} aria-label={`${category} ${tier} membership badge for ${founderNumber}`}>
  <div className="badge-texture" aria-hidden="true"/><div className="badge-orbit" aria-hidden="true"/><div className="badge-spine" aria-hidden="true"/>
  <div className="badge-topline"><span className="ramah-emblem"><Image src="/ramah-app-icon.png" width={42} height={42} alt="Ramah Digital"/></span><span>RAMAH DIGITAL</span><small>THE FOUNDING ERA</small></div>
  <div className="badge-insignia" aria-hidden="true"><span>{character.mark}</span><i/></div><span className="badge-edition">{character.edition}</span>
  <div className="badge-copy"><span className="badge-status">{category} · {membershipStatus.replaceAll('_',' ')}</span>{memberName&&<h2>{memberName}</h2>}<strong>{founderNumber}</strong><h3>{tier}</h3><small>{character.material}</small></div>
  <div className="badge-footer"><span>Official digital membership</span><span>{date?`Active since ${date}`:'Ramah Digital'}</span></div>
  <p className="badge-tagline">Your Home. Your World. Your Journey.</p>
 </article>;
}
