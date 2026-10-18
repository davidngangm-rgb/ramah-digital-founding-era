import type {Metadata} from "next";
import {PublicShell} from "@/components/PublicShell";
import {PageIntro} from "@/components/PageIntro";

const qa=[
  ["What does pre-registration mean?","Before 30 October 2026, you may create your Ramah account and save a membership preference. This does not reserve or assign a Founder Number."],
  ["Is founder status a subscription?","No. Founder status is permanent after verified activation. Ramah Circle platform memberships and individual Creator Circle memberships are separate commercial products."],
  ["Can founder status expire?","Not ordinarily. It may be revoked only through an authorized fraud or integrity process."],
  ["Can I use my website account in the app?","Yes. Both use the same Supabase Auth identity."],
  ["When is my founder number created?","Only after the relevant application, approval, capacity, payment and activation checks."],
  ["Are the numbers reserved when I apply?","No. Accounts and applications do not consume or reserve Founder Numbers."],
  ["How is the Founding Era allocated?","The approved maximum is 600 Founding Travelers, 300 Founding Partners and 100 Founding Creators. Availability is shown only from the verified Ramah record."],
  ["Will my profile be public automatically?","No. Publication requires your consent, your visibility choices and an approval review."]
];

export const metadata:Metadata={title:"Founding Era FAQ",description:"Answers about Ramah Founder identity, membership and verification.",alternates:{canonical:"/faq"}};

export default function Page(){const schema={"@context":"https://schema.org","@type":"FAQPage","mainEntity":qa.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))};return <PublicShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><PageIntro eyebrow="FAQ" title="Clear answers before a permanent decision." copy="What Founder identity means, how membership works and what becomes public." image={false}/><section className="faq standalone">{qa.map(([q,a])=><details key={q}><summary>{q}<span>＋</span></summary><p>{a}</p></details>)}</section></PublicShell>}
