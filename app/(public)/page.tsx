import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {PublicShell} from "@/components/PublicShell";

export const metadata:Metadata={
  title:"Founding Era 2026",
  description:"Choose a Ramah Digital Founding Era membership and complete one application.",
};

const pathways=[
  {
    name:"Founding Travelers",
    allocation:"600 identities",
    copy:"Choose Explore or Voyager and complete your Traveler profile.",
    href:"/founding-era/travelers",
    action:"Choose a Traveler tier",
    image:"/images/founding-era/travelers.webp",
    alt:"Travelers enjoying a coastal city view at sunset",
    position:"center center",
  },
  {
    name:"Founding Stay Partners",
    allocation:"Shared Partner allocation",
    copy:"Register a stay, initial accommodation and required launch media.",
    href:"/founding-era/partners?vertical=stay",
    action:"Register a Stay Partner",
    image:"/images/founding-era/stay-partners.webp",
    alt:"A resort property with guest accommodation and a swimming pool",
    position:"center center",
  },
  {
    name:"Founding Experience Partners",
    allocation:"Shared Partner allocation",
    copy:"Register a business, initial experience, availability and launch media.",
    href:"/founding-era/partners?vertical=experience",
    action:"Register an Experience Partner",
    image:"/images/founding-era/experience-partners.webp",
    alt:"Guests taking part in a guided wildlife experience",
    position:"center center",
  },
  {
    name:"Founding Creators",
    allocation:"100 identities",
    copy:"Apply free for Creator Plus or Creator Pro. Payment remains deferred.",
    href:"/founding-era/creators",
    action:"Choose a Creator tier",
    image:"/images/founding-era/creators.webp",
    alt:"A travel Creator photographing a coastal landscape",
    position:"center center",
  },
] as const;

const referral=(value?:string)=>value&&/^[A-Z0-9]{8,16}$/.test(value.toUpperCase())?value.toUpperCase():"";

export default async function FoundingEraHome({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams,ref=referral(q.ref);
  return <PublicShell hero>
    <main className="fe-home">
      <section className="fe-hero" aria-labelledby="fe-title">
        <Image
          src="/images/founding-era/hero.webp"
          alt="A tropical coastal destination with local accommodation and boats"
          fill
          priority
          sizes="100vw"
          className="fe-hero__image"
        />
        <div className="fe-hero__shade"/>
        <div className="fe-hero__content">
          <span className="fe-kicker">Founding Era 2026</span>
          <h1 id="fe-title">Choose your Founding membership.</h1>
          <p>Create one Ramah account, complete your onboarding and submit your application for review.</p>
          <div className="fe-hero-actions">
            <a className="fe-primary fe-primary--light" href="#founding-pathways">View registration options</a>
            <Link className="fe-secondary fe-secondary--light" href="/auth/sign-in">Continue an application</Link>
          </div>
        </div>
      </section>

      <section className="fe-explainer" aria-labelledby="founding-era-explained">
        <div className="fe-explainer__heading"><span className="fe-kicker">What the Founding Era means</span><h2 id="founding-era-explained">Establish your place in Ramah’s first chapter.</h2></div>
        <div className="fe-explainer__copy">
          <p className="fe-explainer__lead"><strong>A new chapter in travel, hospitality and discovery is being written. The Founding Era is an invitation to help shape it from the beginning.</strong></p>
          <p>For decades, the way people discover the world has been shaped by a relatively small number of platforms. Hotels compete for visibility, experience providers struggle to reach people beyond their existing networks, Creators inspire journeys without always participating in the economic value they generate, and Travelers move between different services just to plan and experience a destination.</p>
          <p>Meanwhile, some of the world&apos;s most remarkable places, businesses, communities and experiences remain largely undiscovered. Not because they lack something worth offering, but because the systems connecting them to the world have not always been built with their realities in mind.</p>
        </div>

        <div className="fe-explainer__bridge">
          <div>
            <p>At Ramah Digital, we believe travel should be more connected, more accessible and more valuable to the people and places that make it possible.</p>
            <p>We are building a digital ecosystem that brings accommodation, local experiences, destination discovery, Creators, communities and intelligent travel planning closer together. A place where a Traveler can discover more than a hotel room, where a hospitality business can present more than its accommodation, where an Experience Partner can bring local knowledge and activities to a wider audience, and where a Creator can build meaningful connections around the places and stories they share.</p>
          </div>
          <div>
            <p>And this vision is not limited to people crossing borders.</p>
            <p>We believe someone living in Juba should have more opportunities to discover Juba. Someone in Nairobi should be able to explore experiences in their own city just as easily as a visitor arriving from another continent. A destination should create value for its own residents as well as the people who travel there.</p>
            <p><strong>That is the kind of travel economy Ramah Digital is working to build.</strong></p>
          </div>
        </div>

        <div className="fe-explainer__chapters">
          <article>
            <h3>Why the Founding Era exists</h3>
            <p>Every platform has a beginning. Before millions of people discover its services, before businesses build their operations around it, and before its communities become established, there are the people who choose to participate when the journey is still taking shape.</p>
            <p>We call this period <strong>the Founding Era</strong>.</p>
            <p>It is our way of recognizing the first Travelers, Stay Partners, Experience Partners and Creators who see the opportunity in what Ramah is building and choose to establish their place within it.</p>
            <p>The Founding Era is more than early registration. It introduces a limited membership program with category-specific recognition, privileges and commercial opportunities. Each membership is designed around the different ways people and businesses participate in Ramah.</p>
            <p>For Travelers, it is an opportunity to become part of the platform&apos;s earliest recognized community of explorers.</p>
            <p>For Stay Partners, it is an opportunity to establish their properties within a growing discovery and accommodation ecosystem, with membership privileges that may support their commercial growth.</p>
            <p>For Experience Partners, it is an opportunity to make local activities, expertise and memorable experiences easier for people to discover and book.</p>
            <p>For Creators, it is an opportunity to join an emerging environment where storytelling, travel discovery, communities and commercial participation can increasingly connect.</p>
            <p>These groups have different needs. That is why the Founding Era does not offer everyone the same membership or the same privileges.</p>
          </article>

          <article>
            <h3>What it means to become a Founding member</h3>
            <p>Becoming a Founding member means establishing a recognized place in Ramah&apos;s early history, subject to the requirements of your selected category and membership tier.</p>
            <p>Depending on the membership you choose, your privileges may include Founding recognition, distinctive membership badges, commission-free booking periods, onboarding support, eligible promotional opportunities, selected program invitations and other benefits defined by your membership terms.</p>
            <p>Some privileges are available through Ramah&apos;s existing systems. Others depend on future feature launches, eligibility or activation. We distinguish between them so that members understand what is available today and what is being developed.</p>
            <p>Founding membership is not a promise of guaranteed bookings, revenue, visibility or investment returns. It is an opportunity to participate in Ramah&apos;s development with defined recognition and membership benefits.</p>
          </article>

          <article className="fe-explainer__chapter-wide">
            <h3>A place for those who want to be part of what comes next</h3>
            <div className="fe-explainer__chapter-columns">
              <div>
                <p>We are not asking people to join simply because Ramah is new.</p>
                <p>We are inviting people who believe that the future of travel can be broader than traditional booking platforms, that local businesses deserve better opportunities to be discovered, that Creators can contribute more than advertisements, and that the people who live in a destination should also benefit from its travel economy.</p>
                <p>The Founding Era begins with a limited number of places:</p>
                <ul className="fe-explainer__allocations">
                  <li><strong>600 Founding Travelers</strong>, joining the earliest recognized Traveler community.</li>
                  <li><strong>300 Founding Partners</strong>, shared between Stay Partners and Experience Partners.</li>
                  <li><strong>100 Founding Creators</strong>, participating in the early Creator ecosystem.</li>
                </ul>
                <p>Each category has its own membership options, eligibility requirements and application process.</p>
              </div>
              <div>
                <p>Your journey begins by choosing the category that represents you, understanding its opportunities and comparing the available memberships. You then create or use your Ramah account, complete the required onboarding and submit your application for Founder review.</p>
                <p>Approval, membership recognition, payment and activation follow the applicable terms for your category.</p>
                <p>The account you establish is your Ramah identity, connecting your Founding Era participation with the wider platform as its supported capabilities become available.</p>
                <p><strong>The Founding Era is not about claiming that the future has already arrived. It is about recognizing those who choose to take part in building it.</strong></p>
                <p>And perhaps, years from now, when people look back at how Ramah began, they will find your name, your business or your creative work among those who were there at the beginning.</p>
              </div>
            </div>
          </article>
        </div>

        <dl className="fe-explainer__steps">
          <div><dt>01</dt><dd><b>Discover your place</b><span>Explore the Founding Era, understand how your category participates in Ramah and compare the privileges of each membership before choosing the one that suits you.</span></dd></div>
          <div><dt>02</dt><dd><b>Prepare your participation</b><span>Create or access your Ramah account and complete the required profile or business onboarding. Partners prepare their actual offerings, inventory and media so their applications can be meaningfully reviewed.</span></dd></div>
          <div><dt>03</dt><dd><b>Become part of the Founding Era</b><span>Submit your completed application for Founder review. Once approved, your recognition and membership privileges follow the applicable eligibility, payment and activation requirements.</span></dd></div>
        </dl>
      </section>

      <section className="fe-pathways" id="founding-pathways" aria-labelledby="pathways-title">
        <header>
          <span className="fe-kicker">Choose your path</span>
          <h2 id="pathways-title">Select your registration type</h2>
          <p>Each path explains what Ramah supports, what your onboarding requires and how its membership choices differ.</p>
        </header>
        <div className="fe-pathway-grid">
          {pathways.map(path=>{
            const join=path.href.includes("?")?"&":"?";
            const href=ref?`${path.href}${join}ref=${ref}`:path.href;
            return <article key={path.name} className="fe-pathway-card">
              <Image src={path.image} alt={path.alt} fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw" style={{objectPosition:path.position}}/>
              <div className="fe-pathway-card__shade"/>
              <div className="fe-pathway-card__content">
                <span>{path.allocation}</span>
                <h3>{path.name}</h3>
                <p>{path.copy}</p>
                <Link href={href}>{path.action}<span aria-hidden="true">→</span></Link>
              </div>
            </article>;
          })}
        </div>
        <div className="fe-allocation-note">
          <b>1,000 Founder identities</b>
          <span>600 Travelers</span>
          <span>300 Founding Partners shared across Stay and Experience</span>
          <span>100 Creators</span>
          <small>Program limits, not live availability.</small>
        </div>
      </section>
    </main>
  </PublicShell>;
}
