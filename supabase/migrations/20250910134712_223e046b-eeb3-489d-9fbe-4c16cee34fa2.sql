-- Verificar se tabelas já existem e ajustar para permitir múltiplas categorias/gêneros

-- Verificar se já existe tabela artists_categories (muitos-para-muitos)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artists_categories') THEN
    CREATE TABLE public.artists_categories (
      artist_id UUID NOT NULL,
      category_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (artist_id, category_id)
    );
    
    -- Enable RLS
    ALTER TABLE public.artists_categories ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Admins can manage artist categories relationships"
    ON public.artists_categories FOR ALL
    USING (EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
      AND is_active = true
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
      AND is_active = true
    ));
    
    CREATE POLICY "Anyone can view artist categories relationships"
    ON public.artists_categories FOR SELECT
    USING (true);
  END IF;
END $$;

-- Garantir que a tabela de relacionamento artists_genres existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artists_genres') THEN
    CREATE TABLE public.artists_genres (
      artist_id UUID NOT NULL,
      genre_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (artist_id, genre_id)
    );
    
    -- Enable RLS
    ALTER TABLE public.artists_genres ENABLE ROW LEVEL SECURITY;
    
    -- Create policies (similar structure)
    CREATE POLICY "Admins can manage artist genres relationships"
    ON public.artists_genres FOR ALL
    USING (EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
      AND is_active = true
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
      AND is_active = true
    ));
    
    CREATE POLICY "Anyone can view artist genres relationships"
    ON public.artists_genres FOR SELECT
    USING (true);
  END IF;
END $$;