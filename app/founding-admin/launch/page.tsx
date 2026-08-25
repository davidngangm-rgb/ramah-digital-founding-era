import Image from 'next/image';
import {createClient} from '@/lib/supabase/server';
import {activateGlobalLaunch,activateLaunchInventory,markLaunchReady} from '../actions';

const label=(value?:string|null)=>value?.replaceAll('_',' ')??'Not available';

export default async function Page(){
  const sb=await createClient();
  const {data:hostApplications}=await sb.from('founding_applications').select('property_id').eq('application_type','host').eq('status','approved').not('property_id','is',null);
  const foundingPropertyIds=[...new Set((hostApplications??[]).map(application=>application.property_id).filter((id):id is string=>Boolean(id)))];
  const [{data:properties},{data:rooms},{data:videos},{data:deals}]=await Promise.all([
    foundingPropertyIds.length?sb.from('hotels').select('id,owner_id,name,type,location,country,property_categories,amenities,cover_photo_url,cover_url,gallery_urls,operational_status,verified,launch_ready_at,launched_at').in('id',foundingPropertyIds).order('created_at',{ascending:false}):Promise.resolve({data:[]}),
    foundingPropertyIds.length?sb.from('rooms').select('id,hotel_id,name,room_type,capacity,bed_count,bathroom_count,available_quantity,price,currency,status,image_url').in('hotel_id',foundingPropertyIds):Promise.resolve({data:[]}),
    foundingPropertyIds.length?sb.from('hotel_videos').select('id,hotel_id,title,video_url,status,moderation_status').in('hotel_id',foundingPropertyIds).eq('content_type','hotel'):Promise.resolve({data:[]}),
    foundingPropertyIds.length?sb.from('hotel_deals').select('id,hotel_id,title,discount_percent,launch_duration_days,launch_activation_status,status').in('hotel_id',foundingPropertyIds):Promise.resolve({data:[]}),
  ]);
  return <><section className="launch-hero"><span className="eyebrow light">Controlled activation</span><h1>Prepared now.<br/><em>Visible when ready.</em></h1><p>One shared Ramah inventory, held safely behind operational status, verification, moderation, and staff permissions.</p></section><section className="executive-section">
    <header className="executive-heading"><span>01</span><div><small>Pre-launch inventory</small><h2>Readiness register</h2></div><p>Review every property’s taxonomy, rooms, media, and optional offer before marking it launch-ready.</p></header>
    <div className="operations-list">{(properties??[]).map(property=>{
      const propertyRooms=(rooms??[]).filter(r=>r.hotel_id===property.id),propertyVideos=(videos??[]).filter(v=>v.hotel_id===property.id),propertyDeals=(deals??[]).filter(d=>d.hotel_id===property.id);
      const images=[property.cover_photo_url??property.cover_url,...(property.gallery_urls??[]),...propertyRooms.map(room=>room.image_url)].filter((url):url is string=>Boolean(url));
      return <article className="operation-card" key={property.id}>
        <header><div><span className={`status-pill status-${property.operational_status}`}>{label(property.launched_at?'live':property.launch_ready_at?'launch_ready':property.operational_status)}</span><h3>{property.name}</h3><p>{property.type} · {[property.location,property.country].filter(Boolean).join(', ')}</p></div><strong>{propertyRooms.length} rooms</strong></header>
        <div className="operation-facts"><span><small>Taxonomy</small>{property.property_categories?.join(', ')||'Categories missing'} · {property.amenities?.length??0} amenities</span><span><small>Media</small>{property.cover_photo_url||property.cover_url?'Cover ✓':'Cover missing'} · {property.gallery_urls?.length??0} gallery · {propertyVideos.length} Discover</span><span><small>Launch Deal</small>{propertyDeals.length?propertyDeals.map(d=>`${d.title} · ${d.discount_percent}% · ${d.launch_duration_days} days · ${label(d.launch_activation_status)}`).join(', '):'Optional · not configured'}</span></div>
        {images.length>0&&<div className="admin-media-strip">{images.map((url,index)=><a href={url} target="_blank" rel="noreferrer" key={`${url}-${index}`}><Image src={url} alt={`${property.name} media ${index+1}`} width={220} height={150} unoptimized/></a>)}</div>}
        <div className="readiness-list">{propertyRooms.map(room=><span key={room.id}><b>{room.name}</b>{room.room_type} · {room.capacity} guests · {room.bed_count} beds · {room.bathroom_count} baths · {room.available_quantity} available · {label(room.status)}</span>)}{propertyVideos.map(video=><span key={video.id}><b>Discover: {video.title}</b>{label(video.status)} · {label(video.moderation_status)} · <a href={video.video_url} target="_blank" rel="noreferrer">review video</a></span>)}</div>
        {!property.launch_ready_at?<form action={markLaunchReady} className="executive-actions"><input type="hidden" name="id" value={property.id}/><input name="reason" required minLength={3} placeholder="Readiness review reason"/><button className="gold-action">Mark launch ready</button></form>:!property.launched_at?<form action={activateLaunchInventory} className="executive-actions"><input type="hidden" name="id" value={property.id}/><input name="reason" required minLength={3} placeholder="Activation reason"/><button className="gold-action">Activate property inventory</button></form>:null}
      </article>})}</div>
    <form action={activateGlobalLaunch} className="global-launch"><span><small>CEO launch control</small><b>Activate every reviewed, launch-ready property.</b><p>This audited action starts each Launch Deal for its full configured duration.</p></span><input name="reason" required minLength={8} placeholder="Required global launch authorization reason"/><button className="button light">Activate global launch</button></form>
  </section></>;
}
