-- Criar policies para storage bucket highlights
CREATE POLICY "Admin can upload highlight images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'highlights');

CREATE POLICY "Admin can update highlight images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'highlights');

CREATE POLICY "Admin can delete highlight images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'highlights');

CREATE POLICY "Public can view highlight images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'highlights');

-- Inserir algumas conexões entre eventos e categorias para teste
DO $$
DECLARE
    event_rec RECORD;
    cat_eletronica UUID;
    cat_rock UUID;
    cat_pop UUID;
BEGIN
    -- Obter IDs das categorias
    SELECT id INTO cat_eletronica FROM music_categories WHERE slug = 'eletronica';
    SELECT id INTO cat_rock FROM music_categories WHERE slug = 'rock';
    SELECT id INTO cat_pop FROM music_categories WHERE slug = 'pop';
    
    -- Associar eventos às categorias (apenas alguns exemplos)
    FOR event_rec IN 
        SELECT id FROM events 
        WHERE status = 'active' 
        ORDER BY created_at 
        LIMIT 10
    LOOP
        -- Inserir uma categoria aleatória para cada evento (evitar duplicatas)
        INSERT INTO event_categories (event_id, category_id)
        VALUES (
            event_rec.id,
            CASE (random() * 3)::int
                WHEN 0 THEN cat_eletronica
                WHEN 1 THEN cat_rock  
                ELSE cat_pop
            END
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;