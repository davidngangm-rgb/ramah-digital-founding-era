export type SocialChannel={name:"Facebook"|"Instagram"|"TikTok"|"YouTube";url:string};

const configured=[
  {name:"Facebook",url:process.env.NEXT_PUBLIC_FACEBOOK_URL||"https://www.facebook.com/profile.php?id=61587858783607"},
  {name:"Instagram",url:process.env.NEXT_PUBLIC_INSTAGRAM_URL||"https://www.instagram.com/ramahdigital08"},
  {name:"TikTok",url:process.env.NEXT_PUBLIC_TIKTOK_URL||"https://www.tiktok.com/@ramah.digital3"},
  {name:"YouTube",url:process.env.NEXT_PUBLIC_YOUTUBE_URL||""},
] satisfies SocialChannel[];

const genericHomepages=new Set(["facebook.com","www.facebook.com","instagram.com","www.instagram.com","tiktok.com","www.tiktok.com","youtube.com","www.youtube.com"]);
export function isOfficialSocialUrl(value:string){try{const url=new URL(value);return url.protocol==="https:"&&!genericHomepages.has(url.hostname+url.pathname.replace(/\/$/,""));}catch{return false}}
export const socialChannels=configured.filter(channel=>isOfficialSocialUrl(channel.url));
