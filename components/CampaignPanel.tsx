import {getCampaign} from '@/lib/supabase/queries';
import {Countdown} from './Countdown';
import {ProductProof} from './ProductProof';
export async function CampaignPanel(){
 const campaign=await getCampaign();
 if(!campaign)return <><section className="campaign-panel campaign-unavailable" aria-labelledby="campaign-title"><div><span className="eyebrow light">The only Global Founding Era</span><h2 id="campaign-title">The founding record is reconnecting.</h2><p>Founder places are issued only from Ramah&apos;s verified live record. Please return shortly.</p></div></section><ProductProof/></>;
 return <><Countdown campaign={campaign}/><ProductProof/></>;
}
