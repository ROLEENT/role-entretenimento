-- Corrigir agenda item com preview_token manualmente
DO $$
DECLARE
    v_event_id UUID := 'b395a531-11c7-4fc8-a54e-935fc78cacc5';
    v_tristan_id UUID;
    v_dylan_id UUID;
    v_katrina_id UUID;
    v_workroom_id UUID;
    v_preview_token TEXT := 'finaldr' || extract(epoch from now())::text;
BEGIN
    -- Buscar o organizador Workroom
    SELECT id INTO v_workroom_id FROM organizers WHERE name ILIKE '%workroom%' LIMIT 1;
    
    -- Criar artistas drag
    INSERT INTO artists (stage_name, slug, city, artist_type, status)
    VALUES ('Tristan Soledade', 'tristan-soledade', 'Porto Alegre', 'drag', 'active')
    ON CONFLICT (slug) DO UPDATE SET stage_name = EXCLUDED.stage_name
    RETURNING id INTO v_tristan_id;
    
    IF v_tristan_id IS NULL THEN
        SELECT id INTO v_tristan_id FROM artists WHERE slug = 'tristan-soledade';
    END IF;
    
    INSERT INTO artists (stage_name, slug, city, artist_type, status)
    VALUES ('Dylan Summers', 'dylan-summers', 'Porto Alegre', 'drag', 'active')
    ON CONFLICT (slug) DO UPDATE SET stage_name = EXCLUDED.stage_name
    RETURNING id INTO v_dylan_id;
    
    IF v_dylan_id IS NULL THEN
        SELECT id INTO v_dylan_id FROM artists WHERE slug = 'dylan-summers';
    END IF;
    
    INSERT INTO artists (stage_name, slug, city, artist_type, status)
    VALUES ('Katrina Addams', 'katrina-addams', 'Porto Alegre', 'drag', 'active')
    ON CONFLICT (slug) DO UPDATE SET stage_name = EXCLUDED.stage_name
    RETURNING id INTO v_katrina_id;
    
    IF v_katrina_id IS NULL THEN
        SELECT id INTO v_katrina_id FROM artists WHERE slug = 'katrina-addams';
    END IF;

    -- Criar agenda item correspondente com preview_token manual
    INSERT INTO agenda_itens (
        id, title, slug, subtitle, summary, city, starts_at, end_at, 
        status, cover_url, location_name, event_id, created_at, updated_at,
        artists_names, is_published, published_at, organizer_id, preview_token
    )
    SELECT 
        v_event_id,
        title,
        slug,
        subtitle,
        summary,
        city,
        date_start,
        date_end,
        'published',
        cover_url,
        'Workroom',
        id,
        created_at,
        updated_at,
        ARRAY['Tristan Soledade', 'Dylan Summers', 'Katrina Addams'],
        true,
        NOW(),
        v_workroom_id,
        v_preview_token
    FROM events 
    WHERE id = v_event_id
    ON CONFLICT (id) DO UPDATE SET
        artists_names = EXCLUDED.artists_names,
        is_published = true,
        published_at = NOW(),
        organizer_id = EXCLUDED.organizer_id,
        preview_token = EXCLUDED.preview_token;
    
    -- Associar os artistas ao agenda item
    INSERT INTO agenda_item_artists (agenda_id, artist_id, position, headliner, role)
    VALUES 
        (v_event_id, v_tristan_id, 0, true, 'headliner'),
        (v_event_id, v_dylan_id, 1, false, 'support'),
        (v_event_id, v_katrina_id, 2, false, 'support')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Artistas drag associados ao evento FINAL DRAG RACE: %, %, %', v_tristan_id, v_dylan_id, v_katrina_id;
END $$;