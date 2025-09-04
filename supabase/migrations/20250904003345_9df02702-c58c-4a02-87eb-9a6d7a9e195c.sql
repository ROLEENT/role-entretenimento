-- Ensure venues table has RLS enabled and public read access
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policy for public venue reading if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'venues' 
        AND policyname = 'venues_select_public'
    ) THEN
        CREATE POLICY venues_select_public ON public.venues 
        FOR SELECT TO anon USING (true);
    END IF;
END $$;