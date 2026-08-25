export type CampaignAccessUser={app_metadata?:Record<string,unknown>}|null|undefined;

export function getCampaignApplicationAccess(status:string|undefined,user:CampaignAccessUser){
  const publiclyOpen=status==='open'||status==='near_capacity';
  const authorizedPreLaunchTest=status==='scheduled'&&user?.app_metadata?.founding_test_access===true;
  return {allowed:publiclyOpen||authorizedPreLaunchTest,publiclyOpen,authorizedPreLaunchTest};
}
