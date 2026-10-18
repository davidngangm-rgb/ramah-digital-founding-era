import type {Metadata} from 'next';
import Link from 'next/link';
import {PublicShell} from '@/components/PublicShell';

export const metadata:Metadata={title:'Founding Era help & contact',description:'Help with Ramah Digital Founding Era registration, onboarding and account access.'};

const topics=[
  ['Registration','Choosing a category or tier, using an existing account, and completing the application journey.'],
  ['Account access','Sign-in, verification, password recovery, or returning to a saved onboarding draft.'],
  ['Partner setup','Property, room, experience, availability, media, launch-video, policy, or payment-preference questions.'],
  ['Application status','Incomplete requirements, submitted applications, Founder review notes, approval, or activation.'],
  ['Creator recruitment','Creator Plus or Pro selection, free recruitment, deferred payment, and post-approval referral access.'],
  ['Technical issue','Upload failures, validation messages, broken navigation, or another problem using the website.'],
] as const;

const answers=[
  ['How do I apply?','Choose your category, read its introduction, select a valid tier, use one Ramah account and complete every required onboarding item. The final review screen submits the application separately.'],
  ['Can I change my tier?','You can change the selected tier before submission. Changes after submission or approval depend on the existing review and commercial rules; contact Ramah before making a payment.'],
  ['When will my application be reviewed?','Ramah does not publish or guarantee a review deadline. Your dashboard shows the authoritative status and any recorded review note.'],
  ['Why is my application incomplete?','The onboarding checklist identifies missing records. Partner media must be securely uploaded and linked; selecting a local file is not enough. Stay Partners also need three complete room offerings.'],
  ['Why is a Partner launch video required?','It gives Founder Operations a reviewable presentation of the real property or experience. The video remains protected and does not publish the business automatically.'],
  ['How do Creator payments work?','Creator recruitment is free. An approved Creator may secure an allocation, but payment and paid capabilities remain deferred until Ramah opens a verified activation process.'],
  ['When does a Creator receive a referral link?','Only after Founder approval. The link records invitation attribution and does not itself create a payout, discount, or paid Creator entitlement.'],
  ['How do I update submitted information?','Drafts are editable. Submitted records are protected for consistent review; use the recorded review note or contact Ramah for a controlled correction.'],
  ['How do I access Ramah after approval?','Use the same Ramah credentials. Recognition and capabilities come from the shared backend after the applicable approval, payment, and activation checks.'],
] as const;

export default function Contact(){return <PublicShell><main className="support-page">
  <header><span className="fe-kicker">Help &amp; contact</span><h1>Get help with your Founding Era application.</h1><p>Choose the topic closest to your question, then contact Ramah using the verified support channel below. Do not send passwords or full payment credentials.</p></header>
  <section className="support-topics" aria-label="Support topics">{topics.map(([title,copy])=><article key={title}><h2>{title}</h2><p>{copy}</p></article>)}</section>
  <section className="support-contact"><div><span className="fe-kicker">Verified contact</span><h2>Write to Ramah support.</h2><p>The repository does not contain an authorized durable support-ticket service. Email remains the truthful contact path; no success message is shown unless your email service sends the message.</p></div><div><a className="fe-primary" href="mailto:ramahdigital08@gmail.com?subject=Founding%20Era%20support">Email Founding Era support</a><a href="mailto:davidngangm@gmail.com?subject=Ramah%20Digital%20inquiry">General operator contact</a><small>Include your account email, application category and a concise description. Never include your password.</small></div></section>
  <section className="support-faq"><header><span className="fe-kicker">Common questions</span><h2>Before you contact us</h2></header>{answers.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
  <footer className="support-footer"><p>Need to continue your application?</p><Link className="fe-primary" href="/auth/sign-in">Sign in to your dashboard</Link></footer>
  </main></PublicShell>}
