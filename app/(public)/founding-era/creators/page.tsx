import Image from 'next/image';
import Link from 'next/link';
import {PublicShell} from '@/components/PublicShell';
import {CreatorNarrative} from '@/components/CreatorNarrative';
import {categoryContent,tiersForPath} from '@/lib/foundingPresentation';

export default async function CreatorTiers({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,ref=q.ref&&/^[A-Z0-9]{8,16}$/.test(q.ref.toUpperCase())?q.ref.toUpperCase():'',content=categoryContent.creator,plans=tiersForPath('creator');
  return <PublicShell><main className="fe-selection">
    <section className="fe-selection-hero"><div className="fe-selection-hero__media"><Image src="/images/founding-era/creators.webp" alt="A travel Creator photographing a coastal landscape" fill priority sizes="(max-width: 760px) 100vw, 42vw"/></div><header><Link className="fe-back" href={ref?`/?ref=${ref}`:'/'}>← Founding Era</Link><span className="fe-kicker">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.intro}</p></header></section>
    <CreatorNarrative plans={plans} refCode={ref}/>
  </main></PublicShell>;
}
