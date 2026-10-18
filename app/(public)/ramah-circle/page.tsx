/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = { title: "Ramah Circle", description: "Ramah's role-aware platform membership ecosystem for Travelers and eligible Partners." };
const travelerPlans = [
  ["Horizon", "US$5", "US$50", "The eligible entry plan for Travelers."],
  ["Summit", "US$10", "US$100", "Expanded Traveler membership."],
  ["Apex", "US$20", "US$200", "The highest purchasable Traveler plan."],
  ["Luminary", "Earned", "Invitation", "Not available for purchase."],
] as const;
const faq = [
  ["What is Ramah Circle?", "Ramah Circle is Ramah's broader platform membership ecosystem. Benefits and capabilities resolve according to an account's eligible roles and approved plan."],
  ["Is Ramah Circle only for Travelers?", "No. Travelers, Stay Partners, Experience Partners and eligible multi-role accounts can participate under role-specific rules. Traveler pricing does not automatically apply to Partners."],
  ["Are Ramah Circle and Creator Circles the same?", "No. Ramah Circle is a platform membership. Creator Circles are independently managed communities inside Ramah, each with its own identity, membership and access rules."],
  ["Can I join more than one Creator Circle?", "Yes. A person can hold independent memberships in several Creator Circles. Membership in one does not grant access to another."],
  ["Does joining a Creator Circle start a Ramah Circle subscription?", "No. Any eligible Horizon promotion is a separate benefit and no recurring Ramah Circle charge begins without an explicit offer, supported mandate and consent."],
  ["Can Partners join Ramah Circle?", "Eligible Stay and Experience Partners can participate under separately approved role-specific benefits. No unapproved Partner pricing is published here."],
] as const;

export default function RamahCirclePage() {
  return <PublicShell>
    <section className="master-creator-hero master-container"><div><span className="master-eyebrow">Ramah Circle / Beyond the journey</span><h1>The best part of discovering the world is finding where you belong.</h1><p>Places can introduce us to people, interests and communities that stay with us long after a journey ends.</p><p>Ramah Circle is the wider membership ecosystem that keeps those connections close—with role-aware benefits for Travelers and eligible Partners.</p><div className="master-actions"><a className="master-button" href="#traveler-plans">Explore Traveler plans</a><Link className="master-text-link" href="/circles">Explore Creator Circles <span aria-hidden>↗</span></Link></div></div><figure><Image src="/images/founding-community.png" fill priority sizes="(max-width: 900px) 100vw, 48vw" alt="People finding belonging around a shared table" /></figure></section>

    <section className="master-story-reading master-container"><span className="master-eyebrow">Connection matters</span><h2>Some places stay with us because of the people we meet there.</h2><p>A shared meal. A conversation that changes the day. A familiar face in a place that once felt new.</p><p>Ramah Circle is designed around the idea that discovery can lead to longer relationships—with Ramah, with participating places and with the people who make a journey matter.</p></section>

    <section className="master-circle-distinction"><header><span className="master-eyebrow">One world of connections</span><h2>Two different kinds of Circles.</h2></header><div><article><b>Ramah Circle</b><p>Ramah's platform-wide, role-aware membership ecosystem. Traveler, Stay Partner and Experience Partner participation can coexist on the same account under distinct approved rules.</p></article><article><b>Creator Circles</b><p>Independent communities led by individual Creators. Each has its own purpose, public or restricted access, membership configuration and subscription lifecycle.</p><Link className="master-text-link" href="/circles">Find a Creator Circle <span aria-hidden>↗</span></Link></article></div></section>

    <section className="master-plans master-container" id="traveler-plans"><header><span className="master-eyebrow">Traveler participation</span><h2>Choose monthly or annual membership.</h2><p>These confirmed prices apply to Traveler participation. They do not create or replace Partner commercial terms, Creator plans or Founding Era identity.</p></header><div className="master-plan-cards">{travelerPlans.map(([name,monthly,annual,note])=><article key={name}><span>{name}</span><div><strong>{monthly}</strong><small>{name==="Luminary"?"":" / month"}</small></div><div><b>{annual}</b><small>{name==="Luminary"?"":" / year"}</small></div><p>{note}</p></article>)}</div><p className="master-commercial-note">Membership activation and recurring billing remain unavailable until payment mandates, cancellation, refunds and settlement are verified with the selected provider.</p></section>

    <section className="master-wide-copy master-container"><div><span className="master-eyebrow">Partners in Ramah Circle</span><h2>Stay and Experience Partners are first-class participants.</h2></div><div><p>Partner benefits resolve against the Partner's role, eligible plan and verified business relationship. Traveler pricing does not apply automatically.</p><p>Existing Founding Partner tiers, prices, benefits and commission-free commitments remain unchanged. No new Partner membership charge is announced here.</p><p>Partner Ramah Circle entitlements remain distinct from Founding Partner membership and the ordinary commercial relationship with Ramah.</p></div></section>

    <section className="master-people"><figure><Image src="/images/founding-community.png" fill sizes="(max-width: 850px) 100vw, 55vw" alt="People continuing a connection through shared interests" /></figure><div><span className="master-eyebrow">Creator Circles take community further</span><h2>An audience follows your work. A community becomes part of it.</h2><p>Creator Circles give individual Creators a distinct place to gather people around stories, interests, knowledge and experiences.</p><p>A person can join several Creator Circles. Each membership stands on its own, and access to one never grants access to another.</p><Link className="master-text-link" href="/circles">Explore Creator Circles <span aria-hidden>↗</span></Link></div></section>

    <section className="master-manifesto master-manifesto--left"><span className="master-eyebrow">Clear membership, no confusion</span><h2>Know what you're joining. Know what it includes.</h2><ul><li>Joining a Creator Circle does not enroll you in Ramah Circle.</li><li>A complimentary Horizon month does not stack across Creator Circles.</li><li>No recurring plan begins without an explicit offer, supported mandate and consent.</li><li>A Partner role does not erase Traveler, Creator or Founder identity.</li><li>Founding Era identity remains separate from recurring membership.</li></ul></section>

    <section className="master-faq master-container"><header><span className="master-eyebrow">Questions &amp; answers</span><h2>The membership should explain itself.</h2></header><div>{faq.map(([question,answer])=><details key={question}><summary>{question}<span aria-hidden>+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="master-final master-container"><span className="master-eyebrow">Beyond the journey</span><h2>Find more than somewhere to go. Find something to be part of.</h2><p>Choose the relationship that fits how you participate, with each membership kept clear and independent.</p><div className="master-actions"><a className="master-button" href="#traveler-plans">Review Traveler plans</a><Link className="master-text-link" href="/circles">Explore Creator Circles <span aria-hidden>↗</span></Link></div></section>
  </PublicShell>;
}
