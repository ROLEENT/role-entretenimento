-- Remoção completa dos artistas fake/teste
-- Primeiro, remover dados relacionados dos artistas fake

-- IDs dos artistas fake identificados
DO $$ 
DECLARE
    fake_artist_ids uuid[] := ARRAY[
        '75ec063b-76ac-4540-a321-63957b55e8c9'::uuid, -- AKILA
        '9374ef93-48b1-4bdb-8cdd-6a027fe61bc3'::uuid, -- Linguini  
        '47bf378c-3cdc-4f2b-98ca-bee3bb8d9461'::uuid, -- Gau Beats
        '1dcf5571-2167-4f07-ba7d-7a57f9b49aa2'::uuid  -- PV5000
    ];
    fake_profile_ids uuid[] := ARRAY[
        'da7a5d69-bd61-4065-92c5-cff67a30dc5e'::uuid, -- João Silva Band
        '9205381b-1971-4b57-8c82-ef16881f6f30'::uuid, -- Hate Moss
        '0f43b5a7-43af-497f-a3d2-06df0b91d0b9'::uuid, -- AKILA profile
        'a0199d45-a730-466b-b179-9d34a4492599'::uuid, -- Linguini profile
        '5537da0a-538c-45ca-a04b-4e782604c3a5'::uuid, -- Gau Beats profile
        '38e342d1-6c55-4b63-8417-695b94e62def'::uuid  -- PV5000 profile
    ];
BEGIN
    -- Remover relacionamentos de gêneros musicais
    DELETE FROM public.artists_genres 
    WHERE artist_id = ANY(fake_artist_ids);
    
    -- Remover relacionamentos de tipos de artista
    DELETE FROM public.artists_artist_types 
    WHERE artist_id = ANY(fake_artist_ids);
    
    -- Remover da tabela agenda_item_artists se existir
    DELETE FROM public.agenda_item_artists 
    WHERE artist_id = ANY(fake_artist_ids);
    
    -- Remover os artistas da tabela principal
    DELETE FROM public.artists 
    WHERE id = ANY(fake_artist_ids);
    
    -- Remover os perfis fake da tabela entity_profiles
    DELETE FROM public.entity_profiles 
    WHERE id = ANY(fake_profile_ids);
    
    RAISE NOTICE 'Artistas fake removidos com sucesso';
END $$;

-- Adicionar constraint para prevenir criação de artistas com nomes fake
CREATE OR REPLACE FUNCTION validate_artist_name_not_fake()
RETURNS trigger AS $$
BEGIN
  -- Verificar se é um nome claramente fake/teste
  IF NEW.stage_name ILIKE '%test%' OR 
     NEW.stage_name ILIKE '%fake%' OR 
     NEW.stage_name ILIKE '%dummy%' OR 
     NEW.stage_name ILIKE '%exemplo%' OR
     NEW.stage_name ILIKE '%PV5000%' OR
     NEW.slug ILIKE '%test%' OR
     NEW.slug ILIKE '%fake%' THEN
    RAISE EXCEPTION 'Nome de artista inválido: não é permitido usar nomes de teste';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação
DROP TRIGGER IF EXISTS validate_artist_name ON public.artists;
CREATE TRIGGER validate_artist_name
  BEFORE INSERT OR UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION validate_artist_name_not_fake();

-- Adicionar constraint similar para entity_profiles
CREATE OR REPLACE FUNCTION validate_entity_profile_name_not_fake()
RETURNS trigger AS $$
BEGIN
  -- Verificar se é um nome claramente fake/teste
  IF NEW.name ILIKE '%test%' OR 
     NEW.name ILIKE '%fake%' OR 
     NEW.name ILIKE '%dummy%' OR 
     NEW.name ILIKE '%exemplo%' OR
     NEW.handle ILIKE '%test%' OR
     NEW.handle ILIKE '%fake%' THEN
    RAISE EXCEPTION 'Nome de perfil inválido: não é permitido usar nomes de teste';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação
DROP TRIGGER IF EXISTS validate_entity_profile_name ON public.entity_profiles;
CREATE TRIGGER validate_entity_profile_name
  BEFORE INSERT OR UPDATE ON public.entity_profiles
  FOR EACH ROW EXECUTE FUNCTION validate_entity_profile_name_not_fake();