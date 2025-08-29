-- Primeira migração: apenas adicionar valor ao enum
DO $$ 
BEGIN 
    -- Adicionar 'viewer' se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'viewer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
        ALTER TYPE public.user_role ADD VALUE 'viewer';
    END IF;
END $$;