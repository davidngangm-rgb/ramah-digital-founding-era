import Image from 'next/image';
import Link from 'next/link';
import {PublicShell} from '@/components/PublicShell';
import {TravelerNarrative} from '@/components/TravelerNarrative';
import {categoryContent,tiersForPath} from '@/lib/foundingPresentation';

export default async function TravelerTiers({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,ref=q.ref&&/^[A-Z0-9]{8,16}$/.test(q.ref.toUpperCase())?q.ref.toUpperCase():'',content=categoryContent.traveler,tiers=tiersForPath('traveler');
  return <PublicShell><main className="fe-selection">
    <section className="fe-selection-hero"><div className="fe-selection-hero__media"><Image src="/images/founding-era/travelers.webp" alt="Travelers enjoying a coastal city view at sunset" fill priority sizes="(max-width: 760px) 100vw, 42vw"/></div><header><Link className="fe-back" href={ref?`/?ref=${ref}`:'/'}>← Founding Era</Link><span className="fe-kicker">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.intro}</p></header></section>
    <TravelerNarrative tiers={tiers} refCode={ref}/>
  </main></PublicShell>;
}
