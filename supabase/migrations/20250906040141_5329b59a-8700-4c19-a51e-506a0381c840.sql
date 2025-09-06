-- Atualizar função create_event_cascade para incluir critérios de curadoria
CREATE OR REPLACE FUNCTION public.create_event_cascade(
  event_data jsonb, 
  partners jsonb DEFAULT '[]'::jsonb, 
  lineup_slots jsonb DEFAULT '[]'::jsonb, 
  performances jsonb DEFAULT '[]'::jsonb, 
  visual_artists jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_event_id uuid;
  partner_item jsonb;
  slot_item jsonb;
  slot_id uuid;
  artist_item jsonb;
  performance_item jsonb;
  visual_item jsonb;
BEGIN
  -- 1. Criar evento principal (incluindo curatorial_criteria)
  INSERT INTO public.events (
    title, subtitle, summary, description,
    venue_id, location_name, address, city, state, country,
    date_start, date_end, doors_open_utc, headliner_starts_utc,
    image_url, cover_url, cover_alt, gallery,
    price_min, price_max, currency,
    ticket_url, ticketing, ticket_rules,
    age_rating, age_notes,
    genres, tags,
    highlight_type, is_sponsored,
    curatorial_criteria,
    links, accessibility,
    seo_title, seo_description, og_image_url,
    series_id, edition_number,
    status, visibility
  )
  SELECT 
    (event_data->>'title')::text,
    (event_data->>'subtitle')::text,
    (event_data->>'summary')::text,
    (event_data->>'description')::text,
    (event_data->>'venue_id')::uuid,
    (event_data->>'location_name')::text,
    (event_data->>'address')::text,
    (event_data->>'city')::text,
    (event_data->>'state')::text,
    (event_data->>'country')::text,
    (event_data->>'date_start')::timestamptz,
    (event_data->>'date_end')::timestamptz,
    (event_data->>'doors_open_utc')::timestamptz,
    (event_data->>'headliner_starts_utc')::timestamptz,
    (event_data->>'image_url')::text,
    (event_data->>'cover_url')::text,
    (event_data->>'cover_alt')::text,
    COALESCE(event_data->'gallery', '[]'::jsonb),
    (event_data->>'price_min')::numeric,
    (event_data->>'price_max')::numeric,
    COALESCE((event_data->>'currency')::text, 'BRL'),
    (event_data->>'ticket_url')::text,
    COALESCE(event_data->'ticketing', '{}'::jsonb),
    COALESCE(event_data->'ticket_rules', '[]'::jsonb),
    (event_data->>'age_rating')::age_rating,
    (event_data->>'age_notes')::text,
    CASE 
      WHEN event_data->'genres' IS NOT NULL THEN 
        array(SELECT jsonb_array_elements_text(event_data->'genres'))
      ELSE '{}'::text[]
    END,
    CASE 
      WHEN event_data->'tags' IS NOT NULL THEN 
        array(SELECT jsonb_array_elements_text(event_data->'tags'))
      ELSE '{}'::text[]
    END,
    COALESCE((event_data->>'highlight_type')::highlight_type, 'none'),
    COALESCE((event_data->>'is_sponsored')::boolean, false),
    COALESCE(event_data->'curatorial_criteria', '{}'::jsonb),
    COALESCE(event_data->'links', '{}'::jsonb),
    COALESCE(event_data->'accessibility', '{}'::jsonb),
    (event_data->>'seo_title')::text,
    (event_data->>'seo_description')::text,
    (event_data->>'og_image_url')::text,
    (event_data->>'series_id')::uuid,
    (event_data->>'edition_number')::integer,
    COALESCE((event_data->>'status')::publication_status, 'draft'),
    COALESCE((event_data->>'visibility')::text, 'public')
  RETURNING id INTO new_event_id;

  -- 2. Criar parceiros
  FOR partner_item IN SELECT jsonb_array_elements(partners) LOOP
    INSERT INTO public.event_partners (
      event_id, partner_id, partner_type, role, display_name, position, is_main
    ) VALUES (
      new_event_id,
      (partner_item->>'partner_id')::uuid,
      (partner_item->>'partner_type')::text,
      (partner_item->>'role')::partner_role,
      (partner_item->>'display_name')::text,
      COALESCE((partner_item->>'position')::integer, 0),
      COALESCE((partner_item->>'is_main')::boolean, false)
    );
  END LOOP;

  -- 3. Criar slots de lineup
  FOR slot_item IN SELECT jsonb_array_elements(lineup_slots) LOOP
    INSERT INTO public.event_lineup_slots (
      event_id, slot_name, start_time, end_time, stage, position, is_headliner, notes
    ) VALUES (
      new_event_id,
      (slot_item->>'slot_name')::text,
      (slot_item->>'start_time')::timestamptz,
      (slot_item->>'end_time')::timestamptz,
      (slot_item->>'stage')::text,
      COALESCE((slot_item->>'position')::integer, 0),
      COALESCE((slot_item->>'is_headliner')::boolean, false),
      (slot_item->>'notes')::text
    ) RETURNING id INTO slot_id;
    
    -- Adicionar artistas ao slot
    IF slot_item->'artists' IS NOT NULL THEN
      FOR artist_item IN SELECT jsonb_array_elements(slot_item->'artists') LOOP
        INSERT INTO public.event_lineup_slot_artists (
          slot_id, artist_id, artist_name, position, role
        ) VALUES (
          slot_id,
          (artist_item->>'artist_id')::uuid,
          (artist_item->>'artist_name')::text,
          COALESCE((artist_item->>'position')::integer, 0),
          COALESCE((artist_item->>'role')::text, 'performer')
        );
      END LOOP;
    END IF;
  END LOOP;

  -- 4. Criar performances
  FOR performance_item IN SELECT jsonb_array_elements(performances) LOOP
    INSERT INTO public.event_performances (
      event_id, performer_name, performance_type, description,
      start_time, duration_minutes, stage, position, contact_info
    ) VALUES (
      new_event_id,
      (performance_item->>'performer_name')::text,
      (performance_item->>'performance_type')::text,
      (performance_item->>'description')::text,
      (performance_item->>'start_time')::timestamptz,
      (performance_item->>'duration_minutes')::integer,
      (performance_item->>'stage')::text,
      COALESCE((performance_item->>'position')::integer, 0),
      COALESCE(performance_item->'contact_info', '{}'::jsonb)
    );
  END LOOP;

  -- 5. Criar artistas visuais
  FOR visual_item IN SELECT jsonb_array_elements(visual_artists) LOOP
    INSERT INTO public.event_visual_artists (
      event_id, artist_name, art_type, description,
      installation_location, contact_info, artwork_images, position
    ) VALUES (
      new_event_id,
      (visual_item->>'artist_name')::text,
      (visual_item->>'art_type')::text,
      (visual_item->>'description')::text,
      (visual_item->>'installation_location')::text,
      COALESCE(visual_item->'contact_info', '{}'::jsonb),
      COALESCE(visual_item->'artwork_images', '[]'::jsonb),
      COALESCE((visual_item->>'position')::integer, 0)
    );
  END LOOP;

  RETURN new_event_id;
END;
$function$;