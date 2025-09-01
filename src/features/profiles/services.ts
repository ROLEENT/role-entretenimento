import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar, uploadCover } from "@/lib/storage";

export interface CreateProfileData {
  // Common fields
  type: 'artista' | 'local' | 'organizador';
  name: string;
  handle: string;
  city: string;
  state: string;
  country: string;
  bio_short: string;
  bio?: string;
  tags?: string[];
  links?: Array<{ type: string; url: string }>;
  contact_email?: string;
  contact_phone?: string;
  visibility: 'public' | 'draft' | 'private';
  
  // Files
  avatar_file?: File;
  cover_file?: File;
  
  // Type-specific data
  [key: string]: any;
}

export async function createProfile(data: CreateProfileData): Promise<string> {
  const { avatar_file, cover_file, ...profileData } = data;
  
  // Create main profile
  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      type: profileData.type,
      handle: profileData.handle.toLowerCase(),
      name: profileData.name,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      bio_short: profileData.bio_short,
      bio: profileData.bio || null,
      tags: profileData.tags || [],
      links: profileData.links || [],
      contact_email: profileData.contact_email || null,
      contact_phone: profileData.contact_phone || null,
      visibility: profileData.visibility
    })
    .select("id")
    .single();
    
  if (error) throw error;
  
  const profileId = created.id;
  
  // Upload images if provided
  let avatar_url: string | undefined;
  let cover_url: string | undefined;
  
  if (avatar_file) {
    avatar_url = await uploadAvatar(profileId, avatar_file);
  }
  
  if (cover_file) {
    cover_url = await uploadCover(profileId, cover_file);
  }
  
  // Update profile with image URLs
  if (avatar_url || cover_url) {
    const updates: any = {};
    if (avatar_url) updates.avatar_url = avatar_url;
    if (cover_url) updates.cover_url = cover_url;
    
    await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profileId);
  }
  
  // Insert type-specific data
  if (profileData.type === 'artista') {
    await supabase.from("profile_artist").insert({
      profile_id: profileId,
      genres: profileData.genres || [],
      agency: profileData.agency || null,
      touring_city: profileData.touring_city || null,
      fee_band: profileData.fee_band || null,
      rider_url: profileData.rider_url || null,
      stageplot_url: profileData.stageplot_url || null,
      presskit_url: profileData.presskit_url || null,
      spotify_id: profileData.spotify_id || null,
      soundcloud_url: profileData.soundcloud_url || null,
      youtube_url: profileData.youtube_url || null,
      pronoun: profileData.pronoun || null
    });
  } else if (profileData.type === 'local') {
    await supabase.from("profile_venue").insert({
      profile_id: profileId,
      address: profileData.address || null,
      lat: profileData.lat || null,
      lon: profileData.lon || null,
      place_id: profileData.place_id || null,
      capacity: profileData.capacity,
      hours: profileData.hours || null,
      price_range: profileData.price_range || null,
      accessibility: profileData.accessibility || null,
      age_policy: profileData.age_policy,
      sound_gear: profileData.sound_gear || null,
      cnpj: profileData.cnpj || null
    });
  } else if (profileData.type === 'organizador') {
    await supabase.from("profile_org").insert({
      profile_id: profileId,
      brand_name: profileData.brand_name || null,
      cnpj: profileData.cnpj || null,
      manager_name: profileData.manager_name || null,
      manager_email: profileData.manager_email || null,
      manager_phone: profileData.manager_phone || null,
      cities: profileData.cities || null,
      about: profileData.about || null
    });
  }
  
  return profileId;
}

export async function followProfile(profileId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("followers")
    .insert({ profile_id: profileId, user_id: userId });
    
  if (error) throw error;
}

export async function unfollowProfile(profileId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("followers")
    .delete()
    .eq("profile_id", profileId)
    .eq("user_id", userId);
    
  if (error) throw error;
}

export async function checkHandleAvailability(handle: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
    
  if (error) throw error;
  
  return !data; // true if available (no data found)
}

export async function getProfileByHandle(handle: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, user_id, type, handle, name, city, state, country, bio_short, bio, avatar_url, cover_url, tags, verified,
      profile_artist(*),
      profile_venue(*),
      profile_org(*),
      links, contact_email, contact_phone, visibility
    `)
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
    
  if (error) throw error;
  return data;
}