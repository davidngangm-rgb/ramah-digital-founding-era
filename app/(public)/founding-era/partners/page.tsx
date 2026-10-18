import Image from 'next/image';
import Link from 'next/link';
import {PublicShell} from '@/components/PublicShell';
import {ExperiencePartnerNarrative} from '@/components/ExperiencePartnerNarrative';
import {StayPartnerNarrative} from '@/components/StayPartnerNarrative';
import {categoryContent,tiersForPath} from '@/lib/foundingPresentation';

export default async function PartnerTiers({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams;
  const vertical=q.vertical==='experience'?'experience':'stay';
  const ref=q.ref&&/^[A-Z0-9]{8,16}$/.test(q.ref.toUpperCase())?q.ref.toUpperCase():'';
  const refQuery=ref?`&ref=${ref}`:'';
  const experience=vertical==='experience';
  const content=categoryContent[vertical],tiers=tiersForPath(vertical);
  return <PublicShell><main className="fe-selection">
    <section className="fe-selection-hero">
      <div className="fe-selection-hero__media"><Image src={experience?'/images/founding-era/experience-partners.webp':'/images/founding-era/stay-partners.webp'} alt={experience?'Guests taking part in a guided wildlife experience':'A resort property with guest accommodation and a swimming pool'} fill priority sizes="(max-width: 760px) 100vw, 42vw"/></div>
      <header>
        <Link className="fe-back" href={ref?`/?ref=${ref}`:'/'}>← Founding Era</Link>
        <span className="fe-kicker">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        <nav className="fe-vertical-switch" aria-label="Partner type"><Link className={!experience?'active':''} href={`/founding-era/partners?vertical=stay${refQuery}`}>Stay Partner</Link><Link className={experience?'active':''} href={`/founding-era/partners?vertical=experience${refQuery}`}>Experience Partner</Link></nav>
      </header>
    </section>
    {experience?<ExperiencePartnerNarrative tiers={tiers} refQuery={refQuery}/>:<StayPartnerNarrative tiers={tiers} refQuery={refQuery}/>}
  </main></PublicShell>;
}
