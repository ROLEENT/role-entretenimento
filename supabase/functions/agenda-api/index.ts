import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

interface AgendaPayload {
  item: {
    title: string;
    slug: string;
    city?: string;
    start_at?: string;
    end_at?: string;
    cover_url?: string;
    alt_text?: string;
    summary?: string;
    ticket_url?: string;
    source_url?: string;
    venue_id?: string;
    organizer_id?: string;
    event_id?: string;
    status?: 'draft' | 'published';
    visibility_type?: 'curadoria' | 'vitrine';
    priority?: number;
    tags?: string[];
    type?: string;
    patrocinado?: boolean;
    anunciante?: string;
    cupom?: string;
    meta_title?: string;
    meta_description?: string;
    noindex?: boolean;
    publish_at?: string;
    unpublish_at?: string;
    focal_point_x?: number;
    focal_point_y?: number;
    artists_names?: string[];
    [key: string]: any;
  };
  occurrences?: Array<{
    start_at: string;
    end_at: string;
  }>;
  ticket_tiers?: Array<{
    name: string;
    price: number;
    currency?: string;
    link?: string;
    available?: boolean;
  }>;
  media?: Array<{
    url: string;
    alt_text?: string;
    kind?: 'image' | 'video';
    position?: number;
  }>;
}

// Sanitize empty strings to null
function sanitizeData(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeData);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.trim() === '') {
        result[key] = null;
      } else {
        result[key] = sanitizeData(value);
      }
    }
    return result;
  }
  return obj;
}

// Validate URLs
function validateUrl(url: string | null): boolean {
  if (!url) return true;
  return url.startsWith('http://') || url.startsWith('https://');
}

// Generate slug suggestion for conflicts
function generateSlugSuggestion(baseSlug: string): string {
  const match = baseSlug.match(/^(.+)-(\d+)$/);
  if (match) {
    const [, base, num] = match;
    return `${base}-${parseInt(num) + 1}`;
  }
  return `${baseSlug}-2`;
}

// Validate duration between dates
function validateDuration(startAt: string, endAt: string): boolean {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return diffMinutes >= 15;
}

// Validate publish data
function validatePublishData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.title?.trim()) errors.push('Título é obrigatório');
  if (!data.slug?.trim()) errors.push('Slug é obrigatório');
  if (!data.city?.trim()) errors.push('Cidade é obrigatória para publicação');
  if (!data.start_at) errors.push('Data de início é obrigatória para publicação');
  if (!data.end_at) errors.push('Data de fim é obrigatória para publicação');
  if (!data.cover_url?.trim()) errors.push('Capa é obrigatória para publicação');
  if (!data.alt_text?.trim()) errors.push('Texto alternativo da capa é obrigatório para publicação');
  
  if (data.start_at && data.end_at && !validateDuration(data.start_at, data.end_at)) {
    errors.push('A duração mínima deve ser de 15 minutos');
  }
  
  if (data.ticket_url && !validateUrl(data.ticket_url)) {
    errors.push('URL de ingressos deve começar com http:// ou https://');
  }
  
  if (data.tags && data.tags.length > 6) {
    errors.push('Máximo 6 tags permitidas');
  }
  
  if (data.tags?.some((tag: string) => tag.length > 24)) {
    errors.push('Tags devem ter no máximo 24 caracteres');
  }
  
  if (data.meta_title && data.meta_title.length > 60) {
    errors.push('Meta título deve ter no máximo 60 caracteres');
  }
  
  if (data.meta_description && data.meta_description.length > 160) {
    errors.push('Meta descrição deve ter no máximo 160 caracteres');
  }
  
  if (data.artists_names && data.artists_names.length > 12) {
    errors.push('Máximo 12 artistas permitidos');
  }
  
  if (data.artists_names?.some((name: string) => name.length > 80)) {
    errors.push('Nomes de artistas devem ter no máximo 80 caracteres');
  }
  
  return errors;
}

// Clean artists_names array
function cleanArtistsNames(names?: string[]): string[] {
  if (!names) return [];
  return names
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

// Check admin permissions using profiles table
async function checkAdminPermissions(supabase: any, requiredRole: string[] = ['admin', 'editor']) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autorizado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || !requiredRole.includes(profile.role)) {
    throw new Error('Permissões insuficientes');
  }
  return user;
}

async function handleGet(supabase: any, url: URL) {
  const pathname = url.pathname.replace('/agenda-api', '');
  const segments = pathname.split('/').filter(Boolean);

  // GET /api/agenda
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'agenda')) {
    const city = url.searchParams.get('city');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const search = url.searchParams.get('search');
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const order = url.searchParams.get('order') || 'priority desc, start_at asc';

    let query = supabase
      .from('agenda_public')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null);

    if (city) query = query.eq('city', city);
    if (from) query = query.gte('start_at', from);
    if (to) query = query.lte('start_at', to);
    if (search) query = query.or(`title.ilike.%${search}%, summary.ilike.%${search}%`);
    if (tags.length > 0) query = query.overlaps('tags', tags);

    const { data, error } = await query
      .order(order.split(',').map(o => o.trim()).join(','))
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [] };
  }

  // GET /slug-exists
  if (segments.length === 1 && segments[0] === 'slug-exists') {
    const slug = url.searchParams.get('slug');
    if (!slug) throw new Error('Slug é obrigatório');

    const { data } = await supabase
      .from('agenda_itens')
      .select('id')
      .ilike('slug', slug)
      .is('deleted_at', null)
      .single();

    const exists = !!data;
    const response: any = { exists };
    
    if (exists) {
      response.suggestion = generateSlugSuggestion(slug);
    }

    return response;
  }

  // GET /agenda/:id/preview
  if (segments.length === 3 && segments[2] === 'preview') {
    const id = segments[1];
    const token = url.searchParams.get('token');

    const { data, error } = await supabase
      .from('agenda_itens')
      .select('*')
      .eq('id', id)
      .eq('preview_token', token)
      .is('deleted_at', null)
      .single();

    if (error || !data) throw new Error('Item não encontrado');
    return { data };
  }

  // GET /agenda/:id
  if (segments.length === 2 && segments[0] === 'agenda') {
    const id = segments[1];
    await checkAdminPermissions(supabase);

    const { data, error } = await supabase
      .from('agenda_itens')
      .select(`
        *,
        agenda_occurrences (*),
        agenda_ticket_tiers (*),
        agenda_media (*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) throw new Error('Item não encontrado');
    return { data };
  }

  throw new Error('Endpoint não encontrado');
}

async function handlePost(supabase: any, url: URL, body: any) {
  const pathname = url.pathname.replace('/agenda-api', '');
  const segments = pathname.split('/').filter(Boolean);
  const user = await checkAdminPermissions(supabase);

  // POST /agenda/:id/publish
  if (segments.length === 3 && segments[2] === 'publish') {
    const id = segments[1];
    
    // Get current item to validate
    const { data: item, error: fetchError } = await supabase
      .from('agenda_itens')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !item) throw new Error('Item não encontrado');

    // Validate publish requirements
    const validationErrors = validatePublishData(item);
    if (validationErrors.length > 0) {
      const error = new Error('Validation failed');
      (error as any).fieldErrors = validationErrors;
      throw error;
    }
    
    const { data, error } = await supabase
      .from('agenda_itens')
      .update({ 
        status: 'published',
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return { data, message: 'Item publicado com sucesso' };
  }

  // POST /agenda/:id/unpublish
  if (segments.length === 3 && segments[2] === 'unpublish') {
    const id = segments[1];
    
    const { data, error } = await supabase
      .from('agenda_itens')
      .update({ 
        status: 'draft',
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return { data, message: 'Item despublicado com sucesso' };
  }

  // POST /agenda/:id/duplicate
  if (segments.length === 3 && segments[2] === 'duplicate') {
    const id = segments[1];
    
    const { data: original } = await supabase
      .from('agenda_itens')
      .select('*')
      .eq('id', id)
      .single();

    if (!original) throw new Error('Item não encontrado');

    const newSlug = `${original.slug}-copia-${Date.now()}`;
    const duplicateData = {
      ...original,
      id: undefined,
      slug: newSlug,
      title: `${original.title} (Cópia)`,
      status: 'draft',
      created_by: user.id,
      updated_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('agenda_itens')
      .insert(duplicateData)
      .select()
      .single();

    if (error) throw error;
    return { data, message: 'Item duplicado com sucesso' };
  }

  // POST /agenda
  if (segments.length === 1 && segments[0] === 'agenda') {
    const payload: AgendaPayload = sanitizeData(body);
    
    if (!payload.item?.title || !payload.item?.slug) {
      throw new Error('Título e slug são obrigatórios');
    }

    // Check for duplicate slug (case-insensitive)
    const { data: existingSlug } = await supabase
      .from('agenda_itens')
      .select('id')
      .ilike('slug', payload.item.slug)
      .is('deleted_at', null)
      .single();

    if (existingSlug) {
      const error = new Error('Slug já existe');
      (error as any).suggestion = generateSlugSuggestion(payload.item.slug);
      throw error;
    }

    if (payload.item.ticket_url && !validateUrl(payload.item.ticket_url)) {
      throw new Error('URL de ingressos inválida');
    }

    if (payload.item.source_url && !validateUrl(payload.item.source_url)) {
      throw new Error('URL de origem inválida');
    }

    // Clean artists_names
    const cleanedItem = {
      ...payload.item,
      artists_names: cleanArtistsNames(payload.item.artists_names)
    };

    // Insert main item
    const itemData = {
      ...cleanedItem,
      created_by: user.id,
      updated_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: item, error: itemError } = await supabase
      .from('agenda_itens')
      .insert(itemData)
      .select()
      .single();

    if (itemError) throw itemError;

    // Insert related data
    if (payload.occurrences?.length) {
      await supabase
        .from('agenda_occurrences')
        .insert(payload.occurrences.map(occ => ({
          agenda_id: item.id,
          ...occ
        })));
    }

    if (payload.ticket_tiers?.length) {
      await supabase
        .from('agenda_ticket_tiers')
        .insert(payload.ticket_tiers.map(tier => ({
          agenda_id: item.id,
          ...tier
        })));
    }

    if (payload.media?.length) {
      await supabase
        .from('agenda_media')
        .insert(payload.media.map(media => ({
          agenda_id: item.id,
          ...media
        })));
    }

    return { data: item, message: 'Item criado com sucesso' };
  }

  throw new Error('Endpoint não encontrado');
}

async function handlePatch(supabase: any, url: URL, body: any) {
  const pathname = url.pathname.replace('/agenda-api', '');
  const segments = pathname.split('/').filter(Boolean);
  const user = await checkAdminPermissions(supabase);

  if (segments.length === 2 && segments[0] === 'agenda') {
    const id = segments[1];
    const payload: AgendaPayload = sanitizeData(body);

    // Get current item for slug history
    const { data: currentItem } = await supabase
      .from('agenda_itens')
      .select('slug')
      .eq('id', id)
      .single();

    if (!currentItem) throw new Error('Item não encontrado');

    // Validate URLs if provided
    if (payload.item?.ticket_url && !validateUrl(payload.item.ticket_url)) {
      throw new Error('URL de ingressos inválida');
    }

    if (payload.item?.source_url && !validateUrl(payload.item.source_url)) {
      throw new Error('URL de origem inválida');
    }

    // Check for slug conflicts if slug is being changed
    if (payload.item?.slug && payload.item.slug !== currentItem.slug) {
      const { data: slugConflict } = await supabase
        .from('agenda_itens')
        .select('id')
        .ilike('slug', payload.item.slug)
        .neq('id', id)
        .is('deleted_at', null)
        .single();

      if (slugConflict) {
        const error = new Error('Slug já existe');
        (error as any).suggestion = generateSlugSuggestion(payload.item.slug);
        throw error;
      }

      // Save old slug for history
      await supabase
        .from('agenda_slug_history')
        .insert({
          agenda_id: id,
          old_slug: currentItem.slug,
          changed_at: new Date().toISOString()
        });
    }

    // Clean artists_names if provided
    const cleanedItem = payload.item?.artists_names 
      ? { ...payload.item, artists_names: cleanArtistsNames(payload.item.artists_names) }
      : payload.item;

    // Update main item
    const itemData = {
      ...cleanedItem,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    const { data: item, error: itemError } = await supabase
      .from('agenda_itens')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();

    if (itemError) throw itemError;

    // Handle related data arrays
    if (payload.occurrences !== undefined) {
      await supabase.from('agenda_occurrences').delete().eq('agenda_id', id);
      if (payload.occurrences.length > 0) {
        await supabase
          .from('agenda_occurrences')
          .insert(payload.occurrences.map(occ => ({
            agenda_id: id,
            ...occ
          })));
      }
    }

    if (payload.ticket_tiers !== undefined) {
      await supabase.from('agenda_ticket_tiers').delete().eq('agenda_id', id);
      if (payload.ticket_tiers.length > 0) {
        await supabase
          .from('agenda_ticket_tiers')
          .insert(payload.ticket_tiers.map(tier => ({
            agenda_id: id,
            ...tier
          })));
      }
    }

    if (payload.media !== undefined) {
      await supabase.from('agenda_media').delete().eq('agenda_id', id);
      if (payload.media.length > 0) {
        await supabase
          .from('agenda_media')
          .insert(payload.media.map(media => ({
            agenda_id: id,
            ...media
          })));
      }
    }

    return { data: item, message: 'Item atualizado com sucesso' };
  }

  throw new Error('Endpoint não encontrado');
}

async function handleDelete(supabase: any, url: URL) {
  const pathname = url.pathname.replace('/agenda-api', '');
  const segments = pathname.split('/').filter(Boolean);
  const user = await checkAdminPermissions(supabase, ['admin']);

  if (segments.length === 2 && segments[0] === 'agenda') {
    const id = segments[1];

    const { data, error } = await supabase
      .from('agenda_itens')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Item não encontrado');

    return { message: 'Item excluído com sucesso' };
  }

  throw new Error('Endpoint não encontrado');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Set auth header if provided
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: '',
      });
    }

    let result;

    switch (req.method) {
      case 'GET':
        result = await handleGet(supabase, url);
        break;
      case 'POST':
        const postBody = await req.json();
        result = await handlePost(supabase, url, postBody);
        break;
      case 'PATCH':
        const patchBody = await req.json();
        result = await handlePatch(supabase, url, patchBody);
        break;
      case 'DELETE':
        result = await handleDelete(supabase, url);
        break;
      default:
        throw new Error('Método não suportado');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('API Error:', error);
    
    const errorResponse: any = { 
      error: error.message || 'Erro interno do servidor',
      success: false 
    };

    // Add suggestion for slug conflicts
    if ((error as any).suggestion) {
      errorResponse.suggestion = (error as any).suggestion;
    }

    // Add field errors for validation failures
    if ((error as any).fieldErrors) {
      errorResponse.fieldErrors = (error as any).fieldErrors;
    }
    
    let status = 500;
    if (error.message === 'Não autorizado') status = 401;
    else if (error.message === 'Permissões insuficientes') status = 403;
    else if (error.message === 'Item não encontrado') status = 404;
    else if (error.message === 'Slug já existe') status = 409;
    else if (error.message === 'Validation failed') status = 400;

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
      }
    );
  }
});