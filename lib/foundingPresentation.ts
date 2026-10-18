import {membershipTiers, type MembershipTier} from './memberships';

export type FoundingPath='traveler'|'stay'|'experience'|'creator';

export type PresentedTier={
  code:string;
  publicCode:string;
  name:string;
  price:number;
  paymentTiming:string;
  summary:string;
  suitableFor:string;
  benefits:string[];
  conditions:string[];
};

const partnerPublicCode:Record<string,string>={
  community_host:'community',founding_host:'founding',signature_host:'signature',prestige_host:'prestige',legacy_host:'legacy',
};

const partnerName=(name:string)=>name.replace(/ Host$/,' Partner');

function partnerBenefits(tier:MembershipTier,path:'stay'|'experience'){
  return tier.benefits.map(benefit=>{
    if(path==='experience'){
      return benefit
        .replace('Property profile, booking management and standard visibility','Experience profile, session management and standard visibility')
        .replace('Featured listing','Eligible featured experience listing')
        .replace('Premium presentation','Premium experience presentation')
        .replace('Host Academy','Partner learning resources')
        .replace('Host Circle','Partner community')
        .replace('host products','Partner products');
    }
    return benefit.replace('Host Circle','Partner community').replace('host products','Partner products');
  });
}

export function tiersForPath(path:FoundingPath):PresentedTier[]{
  if(path==='creator')return [
    {code:'creator_plus',publicCode:'creator_plus',name:'Creator Plus',price:29,paymentTiming:'Future one-time activation',summary:'The core Creator business membership for building a verified presence and community on Ramah.',suitableFor:'Creators who want the complete core profile, Circle and collaboration toolkit.',benefits:['Founding Creator identity after approval and activation','Verified Creator profile after verification','Circle creation and member tools after activation','Eligible Creator Offers and referral attribution','Core Creator and Circle analytics'],conditions:['Free to apply during recruitment','Founder approval is required','Payment and paid capabilities remain deferred until authorized activation']},
    {code:'creator_pro',publicCode:'creator_pro',name:'Creator Pro',price:59,paymentTiming:'Future one-time activation',summary:'Creator Plus with deeper analytics, business tools and qualified priority access.',suitableFor:'Creators preparing to manage a more developed community and commercial practice.',benefits:['Everything included with Creator Plus','Advanced Creator and Circle analytics','Deeper conversion insights and business tools','Priority support','Priority consideration for selected early-access and beta programs'],conditions:['Free to apply during recruitment','Founder approval is required','Priority consideration does not guarantee selection or exposure']},
  ];

  if(path==='traveler')return membershipTiers.filter(tier=>tier.kind==='traveler').map(tier=>({
    code:tier.code,publicCode:tier.code,name:tier.name,price:tier.price,paymentTiming:'One-time Founding membership',summary:tier.summary,
    suitableFor:tier.code==='explore'?'Travelers who want accessible Founding recognition and the standard early-member experience.':'Travelers who value premium recognition, priority support and the approved Voyager privileges.',
    benefits:tier.benefits,conditions:['Founder review and authorized activation are required','A selected tier does not itself issue a Founder Number'],
  }));

  return membershipTiers.filter(tier=>tier.kind==='host').map(tier=>({
    code:tier.code,publicCode:partnerPublicCode[tier.code],name:partnerName(tier.name),price:tier.price,
    paymentTiming:tier.price===0?'No membership charge':'One-time Founding membership',summary:tier.summary.replace(/Host/g,'Partner'),
    suitableFor:tier.code==='community_host'?'Eligible businesses seeking a no-cost Founding entry point.':tier.code==='legacy_host'?'Established businesses seeking the highest approved Founding Partner recognition and support level.':'Businesses comparing recognition, support and approved commercial privileges.',
    benefits:partnerBenefits(tier,path),
    conditions:[tier.code==='community_host'?'Commission-free window: 30 October to 30 November 2026 (exclusive end).':'Commission-free window: 30 October 2026 to 30 January 2027 (exclusive end).','Visibility remains subject to relevance, quality, availability and marketplace rules','Founder review and authorized activation are required'],
  }));
}

export const categoryContent={
  traveler:{eyebrow:'600 Founding Travelers',title:'Explore Ramah from the beginning.',intro:'Founding Travelers are early members who want to discover places, accommodation and experiences through Ramah—whether they are exploring their own city or traveling farther from home.',opportunity:'Choose Explore or Voyager according to the recognition, support and approved member privileges that matter to you. Founding membership is optional; people can still use Ramah without buying a Founder identity.',responsibility:'Complete your personal profile, accept the applicable terms and submit the selected membership for review. A Founder Number is issued only after the required approval, payment and activation checks.'},
  stay:{eyebrow:'300 Founding Partners · shared allocation',title:'Put your stay in front of people ready to discover it.',intro:'Stay Partners include eligible hotels, guesthouses, serviced apartments, lodges and other accommodation businesses. Ramah connects their property, room types, rates, availability, amenities and media to local and travel discovery.',opportunity:'Founding tiers differ by approved recognition, commission-free period, onboarding support, visibility eligibility and support level. Paid membership never purchases organic ranking or guaranteed bookings.',responsibility:'Prepare a complete private property profile, at least three valid room offerings, business policies, accepted payment preferences and a persisted launch video before Founder review.'},
  experience:{eyebrow:'300 Founding Partners · shared allocation',title:'Make a real experience easier to find and book.',intro:'Experience Partners are eligible businesses and providers offering activities, cultural experiences, guided outings, recreation and other bookable things to do. They are not treated as accommodation businesses.',opportunity:'Ramah supports experience profiles, locations, prices, capacity, sessions, availability, media and booking conditions. Founding tiers apply the approved Partner recognition and commercial terms to Experience inventory.',responsibility:'Prepare a complete business profile, one valid initial experience, future availability, policies, imagery and a persisted launch video. Publication remains separate from onboarding and Founder approval.'},
  creator:{eyebrow:'100 Founding Creators',title:'Build a credible Creator presence on Ramah.',intro:'Ramah Creators help people understand places through storytelling, local knowledge and community. The program is designed for travel and culture Creators, photographers, filmmakers, guides and community builders—not only large influencers.',opportunity:'Creator Plus provides the core Creator system. Creator Pro adds deeper analytics, business tools, support and qualified priority consideration for selected programs. Capabilities become available only when their approved activation requirements are met.',responsibility:'Applications are free during recruitment. Complete a reviewable profile and choose an intended plan; Founder approval may secure an allocation, but payment and paid privileges remain deferred until Ramah opens an authorized activation process.'},
} as const;

export function presentedTier(path:FoundingPath,code?:string|null){return tiersForPath(path).find(tier=>tier.code===code||tier.publicCode===code)??null;}
