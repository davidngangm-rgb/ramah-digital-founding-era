"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

const text=(form:FormData,key:string)=>String(form.get(key)??"").trim();
const list=(form:FormData,key:string)=>text(form,key).split(/[\n\r,;]+/).map(value=>value.trim()).filter(Boolean).slice(0,20);
function redirectError(section:string,error:unknown):never{
  if(error&&typeof error==="object"&&"digest" in error&&String(error.digest).startsWith("NEXT_REDIRECT"))throw error;
  redirect(`/creator-studio/${section}?error=${encodeURIComponent(error instanceof Error?error.message:"Unable to save changes")}`);
}
async function context(){const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/auth/sign-in?next=/creator-studio");return{sb,user}}
function uploadedUrl(form:FormData,key:string,bucket:string,userId:string){const value=String(form.getAll(key).at(-1)??"").trim();if(!value)return null;const base=(process.env.NEXT_PUBLIC_SUPABASE_URL??"").replace(/\/$/,"");if(!value.startsWith(`${base}/storage/v1/object/public/${bucket}/${userId}/`))throw new Error(`Invalid ${bucket} storage reference`);return value}

export async function createCreatorCircle(form:FormData){try{const {sb}=await context();const slug=text(form,"slug").toLowerCase();if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error("Use lowercase letters, numbers and hyphens for the public path");const {error}=await sb.rpc("create_creator_circle",{p_slug:slug,p_title:text(form,"title"),p_description:text(form,"description"),p_category:text(form,"category")});if(error)throw error;revalidatePath("/creator-studio");redirect("/creator-studio/circle?notice=Circle created as a private draft")}catch(error){redirectError("circle",error)}}

export async function updateCreatorCircle(form:FormData){try{const {sb,user}=await context();const circleId=text(form,"circleId"),cover=uploadedUrl(form,"circleCoverUrl","covers",user.id);const values:Record<string,unknown>={title:text(form,"title"),description:text(form,"description"),category:text(form,"category"),membership_benefits:list(form,"benefits"),updated_at:new Date().toISOString()};if(cover)values.cover_url=cover;const {error}=await sb.from("creator_circles").update(values).eq("id",circleId).eq("creator_user_id",user.id);if(error)throw error;revalidatePath("/creator-studio");redirect("/creator-studio/circle?notice=Circle details saved")}catch(error){redirectError("circle",error)}}

export async function configureCreatorCircle(form:FormData){try{const {sb}=await context();const {error}=await sb.rpc("configure_creator_circle_membership",{p_circle_id:text(form,"circleId"),p_membership_model:text(form,"membershipModel"),p_access_policy:text(form,"accessPolicy")});if(error)throw error;revalidatePath("/creator-studio");redirect("/creator-studio/circle?notice=Membership access updated")}catch(error){redirectError("circle",error)}}

export async function transitionCreatorCircle(form:FormData){try{const {sb}=await context();const {error}=await sb.rpc("set_creator_circle_launch_state",{p_circle_id:text(form,"circleId"),p_next_state:text(form,"nextState")});if(error)throw error;revalidatePath("/creator-studio");redirect("/creator-studio/circle?notice=Circle status updated")}catch(error){redirectError("circle",error)}}

export async function updateCreatorProfile(form:FormData){try{const {sb,user}=await context();const avatar=uploadedUrl(form,"avatarUrl","avatars",user.id),cover=uploadedUrl(form,"profileCoverUrl","covers",user.id);const values:Record<string,unknown>={headline:text(form,"headline")||null,bio:text(form,"bio")||null,home_base:text(form,"homeBase")||null,places_of_focus:list(form,"places"),profile_status:form.get("published")==="on"?"published":"draft",updated_at:new Date().toISOString()};if(avatar)values.avatar_url=avatar;if(cover)values.cover_url=cover;const {error}=await sb.from("creator_profiles").update(values).eq("user_id",user.id);if(error)throw error;revalidatePath("/creator-studio");redirect("/creator-studio/profile?notice=Creator profile saved")}catch(error){redirectError("profile",error)}}

export async function createCirclePost(form:FormData){try{const {sb}=await context();const body=text(form,"body");if(!body||body.length>10000)throw new Error("Write between 1 and 10,000 characters");const {error}=await sb.rpc("create_creator_circle_post",{p_circle_id:text(form,"circleId"),p_post_type:text(form,"postType"),p_title:text(form,"title")||null,p_body:body,p_visibility:text(form,"visibility"),p_publish:form.get("publish")==="true",p_request_id:crypto.randomUUID()});if(error)throw error;revalidatePath("/creator-studio/content");redirect(`/creator-studio/content?notice=${form.get("publish")==="true"?"Content published":"Draft saved"}`)}catch(error){redirectError("content",error)}}

export async function expressOfferInterest(form:FormData){try{const {sb}=await context();const {error}=await sb.rpc("express_interest_in_creator_offer",{p_offer_id:text(form,"offerId"),p_request_id:crypto.randomUUID()});if(error)throw error;revalidatePath("/creator-studio/offers");redirect("/creator-studio/offers?notice=Interest recorded. This is not an accepted contract or earnings event") }catch(error){redirectError("offers",error)}}
