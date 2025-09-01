import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar, uploadCover } from "@/lib/storage";
import type { CreateProfile } from "./schemas";

/**
 * Criar um novo perfil
 */
export async function createProfile(payload: CreateProfile) {
  // Separar arquivos dos demais dados
  const { avatar_file, cover_file, ...data } = payload;

  // Obter usuário atual
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Usuário não autenticado');

  // Criar perfil base conectado ao usuário
  const { data: created, error } = await supabase
    .from("entity_profiles")
    .insert({
      user_id: user.id,
      type: data.type,
      handle: data.handle.toLowerCase(),
      name: data.name,
      city: data.city, 
      state: data.state, 
      country: data.country,
      bio_short: data.bio_short, 
      bio: data.bio ?? null,
      tags: data.tags ?? [],
      links: data.links ?? [],
      contact_email: data.contact_email ?? null,
      contact_phone: data.contact_phone ?? null,
      visibility: data.visibility,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select("id")
    .single();

  if (error) throw error;

  const profileId = created.id;

  // Upload de imagens
  let avatar_url, cover_url;
  try {
    if (avatar_file) avatar_url = await uploadAvatar(profileId, avatar_file);
    if (cover_file) cover_url = await uploadCover(profileId, cover_file);
    
    if (avatar_url || cover_url) {
      await supabase
        .from("entity_profiles")
        .update({ 
          avatar_url: avatar_url || null, 
          cover_url: cover_url || null 
        })
        .eq("id", profileId);
    }
  } catch (uploadError) {
    console.error("Erro no upload de imagens:", uploadError);
    // Continua sem falhar, apenas não salva as imagens
  }

  // Inserir dados específicos por tipo
  if (data.type === 'artista') {
    const { error: artistError } = await supabase
      .from("profile_artist")
      .insert({
        profile_id: profileId,
        genres: data.genres ?? [],
        agency: data.agency ?? null,
        touring_city: data.touring_city ?? null,
        fee_band: data.fee_band ?? null,
        rider_url: data.rider_url ?? null,
        stageplot_url: data.stageplot_url ?? null,
        presskit_url: data.presskit_url ?? null,
        spotify_id: data.spotify_id ?? null,
        soundcloud_url: data.soundcloud_url ?? null,
        youtube_url: data.youtube_url ?? null,
        pronoun: data.pronoun ?? null
      });
    
    if (artistError) throw artistError;
    
  } else if (data.type === 'local') {
    const { error: venueError } = await supabase
      .from("profile_venue")
      .insert({
        profile_id: profileId,
        address: data.address ?? null,
        lat: data.lat ?? null, 
        lon: data.lon ?? null, 
        place_id: data.place_id ?? null,
        capacity: data.capacity,
        hours: data.hours ?? null,
        price_range: data.price_range ?? null,
        accessibility: data.accessibility ?? null,
        age_policy: data.age_policy,
        sound_gear: data.sound_gear ?? null,
        cnpj: data.cnpj ?? null
      });
    
    if (venueError) throw venueError;
    
  } else if (data.type === 'organizador') {
    const { error: orgError } = await supabase
      .from("profile_org")
      .insert({
        profile_id: profileId,
        brand_name: data.brand_name ?? null,
        cnpj: data.cnpj ?? null,
        manager_name: data.manager_name ?? null,
        manager_email: data.manager_email ?? null,
        manager_phone: data.manager_phone ?? null,
        cities: data.cities ?? null,
        about: data.about ?? null
      });
    
    if (orgError) throw orgError;
  }

  return profileId;
}

/**
 * Buscar perfil por ID
 */
export async function getProfileById(profileId: string) {
  const { data: profile, error } = await supabase
    .from("entity_profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw error;
  if (!profile) return null;

  // Buscar dados específicos baseado no tipo
  let specificData = null;
  
  if (profile.type === 'artista') {
    const { data } = await supabase
      .from("profile_artist")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();
    specificData = data;
    
  } else if (profile.type === 'local') {
    const { data } = await supabase
      .from("profile_venue")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();
    specificData = data;
    
  } else if (profile.type === 'organizador') {
    const { data } = await supabase
      .from("profile_org")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();
    specificData = data;
  }

  return {
    ...profile,
    ...specificData
  };
}

/**
 * Buscar perfil por handle
 */
export async function getProfileByHandle(handle: string) {
  const { data: profile, error } = await supabase
    .from("entity_profiles")
    .select("*")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  if (!profile) return null;

  return getProfileById(profile.id);
}

/**
 * Listar perfis com filtros
 */
export async function listProfiles({
  type,
  city,
  limit = 20,
  offset = 0,
  search
}: {
  type?: string;
  city?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  let query = supabase
    .from("entity_profiles")
    .select("*")
    .eq("visibility", "public");

  if (type) query = query.eq("type", type);
  if (city) query = query.eq("city", city);
  if (search) {
    query = query.or(`name.ilike.%${search}%, handle.ilike.%${search}%, bio_short.ilike.%${search}%`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

/**
 * Atualizar perfil
 */
export async function updateProfile(profileId: string, payload: Partial<CreateProfile>) {
  const { avatar_file, cover_file, ...data } = payload;

  // Atualizar dados básicos do perfil
  const { error } = await supabase
    .from("entity_profiles")
    .update({
      ...(data.name && { name: data.name }),
      ...(data.handle && { handle: data.handle.toLowerCase() }),
      ...(data.city && { city: data.city }),
      ...(data.state && { state: data.state }),
      ...(data.country && { country: data.country }),
      ...(data.bio_short !== undefined && { bio_short: data.bio_short }),
      ...(data.bio !== undefined && { bio: data.bio || null }),
      ...(data.tags && { tags: data.tags }),
      ...(data.links && { links: data.links }),
      ...(data.contact_email !== undefined && { contact_email: data.contact_email || null }),
      ...(data.contact_phone !== undefined && { contact_phone: data.contact_phone || null }),
      ...(data.visibility && { visibility: data.visibility })
    })
    .eq("id", profileId);

  if (error) throw error;

  // Upload de novas imagens se fornecidas
  let avatar_url, cover_url;
  try {
    if (avatar_file) avatar_url = await uploadAvatar(profileId, avatar_file);
    if (cover_file) cover_url = await uploadCover(profileId, cover_file);
    
    if (avatar_url || cover_url) {
      await supabase
        .from("entity_profiles")
        .update({ 
          ...(avatar_url && { avatar_url }),
          ...(cover_url && { cover_url })
        })
        .eq("id", profileId);
    }
  } catch (uploadError) {
    console.error("Erro no upload de imagens:", uploadError);
  }

  // Atualizar dados específicos se fornecidos
  if (data.type === 'artista' && Object.keys(data).some(key => [
    'genres', 'agency', 'touring_city', 'fee_band', 'rider_url', 
    'stageplot_url', 'presskit_url', 'spotify_id', 'soundcloud_url', 
    'youtube_url', 'pronoun'
  ].includes(key))) {
    await supabase
      .from("profile_artist")
      .upsert({
        profile_id: profileId,
        ...(data.genres && { genres: data.genres }),
        ...(data.agency !== undefined && { agency: data.agency || null }),
        ...(data.touring_city !== undefined && { touring_city: data.touring_city || null }),
        ...(data.fee_band !== undefined && { fee_band: data.fee_band || null }),
        ...(data.rider_url !== undefined && { rider_url: data.rider_url || null }),
        ...(data.stageplot_url !== undefined && { stageplot_url: data.stageplot_url || null }),
        ...(data.presskit_url !== undefined && { presskit_url: data.presskit_url || null }),
        ...(data.spotify_id !== undefined && { spotify_id: data.spotify_id || null }),
        ...(data.soundcloud_url !== undefined && { soundcloud_url: data.soundcloud_url || null }),
        ...(data.youtube_url !== undefined && { youtube_url: data.youtube_url || null }),
        ...(data.pronoun !== undefined && { pronoun: data.pronoun || null })
      });
  }

  // Similar para venue e organizador...
  if (data.type === 'local' && Object.keys(data).some(key => [
    'address', 'lat', 'lon', 'place_id', 'capacity', 'hours', 
    'price_range', 'accessibility', 'age_policy', 'sound_gear', 'cnpj'
  ].includes(key))) {
    await supabase
      .from("profile_venue")
      .upsert({
        profile_id: profileId,
        ...(data.address !== undefined && { address: data.address }),
        ...(data.lat !== undefined && { lat: data.lat }),
        ...(data.lon !== undefined && { lon: data.lon }),
        ...(data.place_id !== undefined && { place_id: data.place_id || null }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.hours !== undefined && { hours: data.hours }),
        ...(data.price_range !== undefined && { price_range: data.price_range }),
        ...(data.accessibility !== undefined && { accessibility: data.accessibility }),
        ...(data.age_policy !== undefined && { age_policy: data.age_policy }),
        ...(data.sound_gear !== undefined && { sound_gear: data.sound_gear }),
        ...(data.cnpj !== undefined && { cnpj: data.cnpj || null })
      });
  }

  if (data.type === 'organizador' && Object.keys(data).some(key => [
    'brand_name', 'cnpj', 'manager_name', 'manager_email', 
    'manager_phone', 'cities', 'about'
  ].includes(key))) {
    await supabase
      .from("profile_org")
      .upsert({
        profile_id: profileId,
        ...(data.brand_name !== undefined && { brand_name: data.brand_name || null }),
        ...(data.cnpj !== undefined && { cnpj: data.cnpj || null }),
        ...(data.manager_name !== undefined && { manager_name: data.manager_name || null }),
        ...(data.manager_email !== undefined && { manager_email: data.manager_email || null }),
        ...(data.manager_phone !== undefined && { manager_phone: data.manager_phone || null }),
        ...(data.cities !== undefined && { cities: data.cities }),
        ...(data.about !== undefined && { about: data.about || null })
      });
  }

  return true;
}

/**
 * Deletar perfil
 */
export async function deleteProfile(profileId: string) {
  const { error } = await supabase
    .from("entity_profiles")
    .delete()
    .eq("id", profileId);

  if (error) throw error;
  return true;
}

/**
 * Seguir um perfil
 */
export async function follow(profileId: string, userId?: string) {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    userId = user.id;
  }

  const { error } = await supabase
    .from("followers")
    .insert({ profile_id: profileId, user_id: userId });

  if (error) throw error;
  return true;
}

/**
 * Deixar de seguir um perfil
 */
export async function unfollow(profileId: string, userId?: string) {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    userId = user.id;
  }

  const { error } = await supabase
    .from("followers")
    .delete()
    .eq("profile_id", profileId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

/**
 * Verificar se usuário segue um perfil
 */
export async function isFollowing(profileId: string, userId?: string) {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    userId = user.id;
  }

  const { data, error } = await supabase
    .from("followers")
    .select("id")
    .eq("profile_id", profileId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Obter estatísticas do perfil
 */
export async function getProfileStats(profileId: string) {
  const { data, error } = await supabase
    .from("profile_stats")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw error;
  return data || { followers_count: 0, upcoming_events_count: 0 };
}

/**
 * Verificar se usuário pode editar perfil
 */
export async function canEditProfile(profileId: string, userId?: string) {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    userId = user.id;
  }

  const { data, error } = await supabase
    .from("profile_roles")
    .select("role")
    .eq("profile_id", profileId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data && ['owner', 'editor'].includes(data.role);
}