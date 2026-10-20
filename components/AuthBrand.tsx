import Image from 'next/image';
import Link from 'next/link';

export function AuthBrand(){
  return <Link className="brand auth-brand" href="/" aria-label="Ramah Digital home">
    <Image src="/ramah-app-icon.png" width={48} height={48} alt="" priority />
    <span className="auth-brand__wordmark"><b>RAMAH</b><small>DIGITAL</small></span>
  </Link>;
}
