import { supabase } from "@/integrations/supabase/client";

export type ProfileType = "artista" | "local" | "organizador";
export type Profile = {
  id: string;
  user_id: string;
  type: ProfileType;
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
  profile_artist?: any;
  profile_venue?: any;
  profile_org?: any;
};

export async function getProfileByHandle(handle: string) {
  const { data, error } = await supabase
    .from("entity_profiles")
    .select(`
      id, user_id, type, handle, name, city, state, country, bio_short, bio, avatar_url, cover_url, tags, verified,
      profile_artist(*),
      profile_venue(*),
      profile_org(*),
      links, contact_email, contact_phone, visibility
    `)
    .eq("handle", handle.toLowerCase())
    .limit(1)
    .maybeSingle();
  if (error) throw error;
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
    .from("entity_profiles")
    .select("id, user_id, type, handle, name, city, state, country, avatar_url, cover_url, tags", { count: "exact" });

  // Filter by visibility if specified (defaults to public for public site)
  if (f.visibility) {
    q = q.eq("visibility", f.visibility);
  } else {
    // Default to public only for public site
    q = q.eq("visibility", "public");
  }

  if (f.type) q = q.eq("type", f.type);
  if (f.city) q = q.ilike("city", f.city);
  if (f.q) q = q.ilike("name", `%${f.q}%`);
  if (f.tags?.length) q = q.contains("tags", f.tags);

  if (f.order === "az") q = q.order("name", { ascending: true });
  else q = q.order("created_at", { ascending: false });

  const from = f.offset ?? 0;
  const to = from + ((f.limit ?? 24) - 1);
  const { data, error, count } = await q.range(from, to);
  if (error) throw error;
  return { data: data as Profile[], total: count ?? 0 };
}