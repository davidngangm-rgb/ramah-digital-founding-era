import Image from 'next/image';import {tierName} from '@/lib/memberships';

type Props={founderNumber:string;founderType:'travel'|'host'|string;tierCode?:string|null;compact?:boolean};

const badgeCharacter:Record<string,{mark:string;material:string;edition:string}>={
 explore:{mark:'✦',material:'Brushed silver · emerald enamel',edition:'The First Passage'},
 voyager:{mark:'◇',material:'Platinum · sapphire glass',edition:'Beyond the Horizon'},
 community_host:{mark:'⌂',material:'Hospitality steel · warm nickel',edition:'The Open Door'},
 founding_host:{mark:'R',material:'Polished gold · heritage enamel',edition:'The First Welcome'},
 signature_host:{mark:'S',material:'Black titanium · gold inlay',edition:'The Signature Standard'},
 prestige_host:{mark:'P',material:'Platinum · emerald crystal',edition:'The Grand Arrival'},
 legacy_host:{mark:'L',material:'Obsidian · platinum · 24k gold',edition:'The Legacy Reserve'},
};

export function FounderBadge({founderNumber,founderType,tierCode,compact=false}:Props){
 const host=founderType==='host';
 const status=host?'Founding Host':'Founding Traveler';
 const tier=tierName(tierCode),character=badgeCharacter[tierCode??'']??{mark:'R',material:'Ramah heritage metal',edition:'The Founding Era'};
 return <article className={`founder-credential badge-${tierCode??'default'}${compact?' compact':''}`} aria-label={`${tier} Founder Badge for ${founderNumber}`}>
  <div className="badge-texture" aria-hidden="true"/><div className="badge-orbit" aria-hidden="true"/><div className="badge-spine" aria-hidden="true"/><div className="badge-topline"><span className="ramah-emblem"><Image src="/ramah-app-icon.png" width={42} height={42} alt=""/></span><span>RAMAH DIGITAL</span><small>THE FOUNDING ERA</small></div>
  <div className="badge-insignia" aria-hidden="true"><span>{character.mark}</span><i/></div><span className="badge-edition">{character.edition}</span>
  <div className="badge-copy"><span className="badge-status">{status}</span><strong>{founderNumber}</strong><h3>{tier}</h3><small>{character.material}</small></div>
  <div className="badge-footer"><span>Lifetime Founder</span><span>Authenticated · 2026</span></div>
 </article>;
}
