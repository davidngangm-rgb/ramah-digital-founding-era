import {createClient} from '@supabase/supabase-js';

const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key||!url.includes('ugolslqisiwzxexgbnbp.supabase.co'))throw new Error('The linked Ramah production project and service role are required.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {data,error}=await client.storage.listBuckets();
if(error)throw error;
const required=['avatars','covers','hotel-images','room-images','videos','founding-verification-documents'];
for(const name of required){
  const bucket=data.find(item=>item.id===name);
  if(!bucket)throw new Error(`Missing Storage bucket: ${name}`);
  console.log(JSON.stringify({bucket:name,public:bucket.public,fileSizeLimit:bucket.file_size_limit,allowedMimeTypes:bucket.allowed_mime_types}));
}
