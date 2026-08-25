import {signIn,signUp} from '@/app/auth/actions';
import {PROPERTY_TYPES} from '@/lib/onboarding';

export function AuthForm({mode,type='traveler',error,next}:{mode:'in'|'up';type?:string;error?:string;next?:string}){
  return <form action={mode==='in'?signIn:signUp} className="auth-form">
    <input type="hidden" name="type" value={type}/>
    <input type="hidden" name="next" value={next}/>
    {mode==='up'&&<label>{type==='host'?'Owner or manager name':'Full name'}<input required autoComplete="name" name="name" minLength={2}/></label>}
    <label>Email address<input required type="email" autoComplete="email" name="email" inputMode="email"/></label>
    <label>Password<input required type="password" autoComplete={mode==='in'?'current-password':'new-password'} name="password" minLength={8}/></label>
    {mode==='up'&&type==='host'&&<><label>Property type<select name="propertyType" required defaultValue=""><option value="" disabled>Choose a property type</option>{PROPERTY_TYPES.map(value=><option key={value} value={value}>{value}</option>)}</select></label><label>Property name<input required name="propertyName" minLength={2} autoComplete="organization" placeholder="e.g. Nile Riverside Lodge"/></label><small className="wide">This creates your host account only. Your private property draft is created after you review and submit its information.</small></>}
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="button dark" type="submit">{mode==='in'?'Enter your portal':'Create one Ramah account'}</button>
    <small>By continuing, you agree to Ramah’s Terms and acknowledge the Privacy Policy.</small>
  </form>;
}
