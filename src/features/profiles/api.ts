import { supabase } from "@/integrations/supabase/client";

export type ProfileType = "artista" | "local" | "organizador";
export type Profile = {
  id: string;
  user_id: string | null;
  type: ProfileType;
  artist_subtype?: string | null;
  artist_type?: string | null;
  instagram?: string | null;
  handle: string;
  name: string;
  city: string;
  state: string;
  country: string;
  bio_short?: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  tags?: string[];
  verified?: boolean;
  links?: Array<{ type: string; url: string }>;
  contact_email?: string | null;
  contact_phone?: string | null;
  visibility?: string;
  followers_count?: number;
  profile_artist?: any;
  profile_venue?: any;
  profile_org?: any;
};

export async function getProfileByHandle(handle: string) {
  // First, get the basic profile data
  const { data, error } = await supabase
    .from("entity_profiles")
    .select(`
      id, user_id, type, handle, name, city, state, country, bio_short, bio, avatar_url, cover_url, tags, verified,
      links, contact_email, contact_phone, visibility, source_id
    `)
    .eq("handle", handle.toLowerCase())
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  if (!data) return null;
  
  // If it's an artist and has source_id, get additional artist data
  if (data.type === 'artista' && data.source_id) {
    const { data: artistData } = await supabase
      .from("artists")
      .select("artist_type, instagram")
      .eq("id", data.source_id)
      .maybeSingle();
    
    if (artistData) {
      (data as any).artist_type = artistData.artist_type;
      (data as any).instagram = artistData.instagram;
    }
  }
  
  return data as Profile | null;
}

export type ListFilters = {
  q?: string;
  type?: ProfileType | "";
  city?: string;
  tags?: string[];
  order?: "trend" | "followers" | "az";
  limit?: number;
  offset?: number;
  visibility?: "public" | "draft" | "private";
};

export async function listProfiles(f: ListFilters) {
  let q = supabase
    .from("profiles_with_stats")
    .select("id, user_id, type, handle, name, city, state, country, avatar_url, cover_url, tags, verified, followers_count", { count: "exact" });

  if (f.type) q = q.eq("type", f.type);
  if (f.city) q = q.ilike("city", `%${f.city}%`);
  if (f.q) q = q.ilike("name", `%${f.q}%`);
  if (f.tags?.length) q = q.contains("tags", f.tags);

  // Ordenação
  if (f.order === "az") {
    q = q.order("name", { ascending: true });
  } else if (f.order === "followers") {
    q = q.order("followers_count", { ascending: false });
  } else {
    // Default: trend (created_at desc)
    q = q.order("created_at", { ascending: false });
  }

  const from = f.offset ?? 0;
  const to = from + ((f.limit ?? 24) - 1);
  const { data, error, count } = await q.range(from, to);
  if (error) throw error;
  return { data: data as Profile[], total: count ?? 0 };
}