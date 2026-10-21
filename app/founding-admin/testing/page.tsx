import {redirect} from 'next/navigation';

// Retain the legacy route for bookmarked URLs, but remove testing controls from
// the production Founder Admin interface. Backend authorization and test tools
// remain intact for controlled development workflows.
export default function RetiredTestingAccessPage(){
  redirect('/founding-admin');
}
