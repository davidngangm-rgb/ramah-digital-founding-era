export const PUBLIC_SITE_URL="https://founding.ramahdigital.online";
export const site={name:"Ramah Digital",url:PUBLIC_SITE_URL,description:"Travel, community and hospitality shaped around the places and people that make a journey matter.",appUrl:process.env.NEXT_PUBLIC_APP_URL??PUBLIC_SITE_URL,operationsUrl:process.env.NEXT_PUBLIC_OPERATIONS_URL??`${PUBLIC_SITE_URL}/founding-admin`};
export const publicNav=[["Founding Era","/"]] as const;
export const secondaryNav=[["Help & contact","/contact"],["Privacy","/legal/privacy"],["Terms","/legal/terms"]] as const;
