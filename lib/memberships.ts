export type MembershipKind = "traveler" | "host";

export type MembershipTier = {
  code: string;
  kind: MembershipKind;
  name: string;
  price: number;
  summary: string;
  legacy: string;
  benefits: string[];
  launchBenefits?: string[];
};

export const membershipTiers: MembershipTier[] = [
  {code:"explore",kind:"traveler",name:"Explore",price:29,summary:"The accessible way into the Ramah traveler ecosystem.",legacy:"For the traveler who wants to say: I was there at the beginning.",benefits:["Permanent Founder Badge in brushed silver and emerald","Founder Number and wall-quality Founder Certificate","Personal traveler profile and Founder Dashboard","Traveler Circle and Founder Hall eligibility","Early access and standard support"],launchBenefits:["VOYA AI, Ramah Card and eligible Founder privileges"]},
  {code:"voyager",kind:"traveler",name:"Voyager",price:49,summary:"The premium early-member experience for travelers.",legacy:"For those who see every horizon as the beginning of another story.",benefits:["Permanent platinum and sapphire Founder Badge","Founder Number and wall-quality Founder Certificate","Enhanced member offers and travel discovery","Founder Circle, Founder Hall eligibility and priority support","Invitation to the Ramah Annual Gala"],launchBenefits:["VOYA AI trip planning, Ramah Card and premium platform features"]},
  {code:"community_host",kind:"host",name:"Community Host",price:0,summary:"A frictionless entry point for legitimate hospitality businesses.",legacy:"For independent hosts whose welcome gives a destination its soul.",benefits:["Permanent modern-steel Founder Badge","Founder Number and display-ready Founder Certificate","One month free commission","Property profile, booking management and standard visibility","Host Circle and Founder Hall eligibility"]},
  {code:"founding_host",kind:"host",name:"Founding Host",price:29,summary:"Founder-era onboarding, recognition and community access.",legacy:"For the properties that opened their doors while Ramah was still being written.",benefits:["Permanent premium-gold Founder Badge","Founder Number and display-ready Founder Certificate","Three months free commission","Priority onboarding, verification and Founding Era visibility","Host Circle, Founder community and priority support"]},
  {code:"signature_host",kind:"host",name:"Signature Host",price:59,summary:"Stronger visibility and additional business capabilities.",legacy:"For hosts turning a distinctive standard of service into a lasting signature.",benefits:["Permanent black-titanium and gold Founder Badge","Founder Number and display-ready Founder Certificate","Three months free commission","Featured listing, enhanced analytics and Host Academy","Founder Hall eligibility and priority support"]},
  {code:"prestige_host",kind:"host",name:"Prestige Host",price:99,summary:"Premium positioning for established properties.",legacy:"For remarkable properties prepared to represent hospitality at its finest.",benefits:["Permanent platinum and emerald-crystal Founder Badge","Founder Number and display-ready Founder Certificate","Three months free commission","Premium presentation, advanced insights and marketing consideration","Founder Hall eligibility and Annual Gala invitation"]},
  {code:"legacy_host",kind:"host",name:"Legacy Host",price:199,summary:"The highest standard Host membership for a long-term Ramah relationship.",legacy:"For institutions built to outlast seasons—and help define Ramah’s first chapter.",benefits:["Permanent platinum, gold and obsidian Founder Badge","Founder Number and display-ready Founder Certificate","Three months free commission","Highest eligible visibility and membership-level support","VIP Annual Gala invitation and Founder Hall eligibility"],launchBenefits:["Early access to major host products and eligible future Ramah business services"]},
];

export const tiersFor = (kind: MembershipKind) => membershipTiers.filter((tier)=>tier.kind===kind);
export const tierName = (code?: string|null) => membershipTiers.find((tier)=>tier.code===code)?.name ?? code?.replaceAll("_"," ") ?? "Not selected";
