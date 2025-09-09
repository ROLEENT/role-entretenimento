-- Criar os artistas apenas primeiro, sem agenda item por enquanto
DO $$
DECLARE
    v_event_id UUID := 'b395a531-11c7-4fc8-a54e-935fc78cacc5';
    v_tristan_id UUID;
    v_dylan_id UUID;
    v_katrina_id UUID;
BEGIN
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
    
    RAISE NOTICE 'Artistas drag criados: Tristan %, Dylan %, Katrina %', v_tristan_id, v_dylan_id, v_katrina_id;
END $$;