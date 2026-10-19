export function travelerProfileNextStep(fullName:string,city:string){
  if(fullName.trim()&&city.trim())return '/portal/apply?notice=Profile saved. Review your selected membership to continue.';
  return '/portal/onboarding?notice=Profile saved. Add your name and city to complete this step.#profile';
}

export function stayRoomNextStep(completeRoomCount:number){
  return completeRoomCount>=3?'#payment-methods':'#rooms';
}
