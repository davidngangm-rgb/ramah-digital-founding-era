import {signIn,signUp} from '@/app/auth/actions';
import {PROPERTY_TYPES} from '@/lib/onboarding';import Link from 'next/link';

export function AuthForm({mode,type='traveler',tier,vertical='stay',referral,error,next}:{mode:'in'|'up';type?:string;tier?:string;vertical?:'stay'|'experience';referral?:string;error?:string;next?:string}){
  const experiencePartner=mode==='up'&&type==='host'&&vertical==='experience';
  return <form action={mode==='in'?signIn:signUp} className="auth-form">
    <input type="hidden" name="type" value={type}/>
    <input type="hidden" name="tier" value={tier}/>
    <input type="hidden" name="vertical" value={vertical}/>
    <input type="hidden" name="referral" value={referral}/>
    <input type="hidden" name="next" value={next}/>
    {mode==='up'&&<label>{type==='host'?'Authorized representative name':'Full name'}<input required autoComplete="name" name="name" minLength={2}/></label>}
    <label>Email address<input required type="email" autoComplete="email" name="email" inputMode="email"/></label>
    <label>Password<input required type="password" autoComplete={mode==='in'?'current-password':'new-password'} name="password" minLength={8}/></label>
    {mode==='up'&&type==='host'&&!experiencePartner&&<><label>Property type<select name="propertyType" required defaultValue=""><option value="" disabled>Choose a property type</option>{PROPERTY_TYPES.map(value=><option key={value} value={value}>{value}</option>)}</select></label><label>Property name<input required name="businessName" minLength={2} autoComplete="organization" placeholder="e.g. Nile Riverside Lodge"/></label><small className="wide">This creates your Stay Partner account only. Your private property draft is created during onboarding.</small></>}
    {experiencePartner&&<><label>Business name<input required name="businessName" minLength={2} autoComplete="organization" placeholder="e.g. Coastline Culture Walks"/></label><label>Provider type<select name="experienceProviderType" required defaultValue=""><option value="" disabled>Choose a provider type</option><option value="experience_provider">Experience provider</option><option value="tour_operator">Tour operator</option></select></label><small className="wide">This creates your Experience Partner account only. Your business profile and first experience are completed privately after sign-in.</small></>}
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="button dark" type="submit">{mode==='in'?'Enter your portal':'Create your Ramah account'}</button>
    {mode==='in'&&<Link className="legal-link" href="/auth/forgot-password">Forgot your password?</Link>}
    <small>By continuing, you confirm that you have reviewed Ramah&apos;s <Link className="legal-link" href="/legal/terms" target="_blank" rel="noopener">Terms</Link> and acknowledge the <Link className="legal-link" href="/legal/privacy" target="_blank" rel="noopener">Privacy Policy</Link>. These links open in a new tab so this form remains available.</small>
  </form>;
}
