-- Add missing fields to events table and create storage bucket
-- Add slug, tags, and rename date fields

-- Add missing columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS start_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS end_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cover_url text;

-- Copy data from old date fields to new ones if they exist
UPDATE public.events 
SET start_at = date_start, end_at = date_end
WHERE start_at IS NULL;

-- Create storage bucket for event covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);

-- Create function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_event_slug(p_title text, p_event_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(trim(regexp_replace(p_title, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'evento';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and increment if necessary
  WHILE EXISTS (
    SELECT 1 FROM public.events 
    WHERE slug = final_slug 
    AND (p_event_id IS NULL OR id != p_event_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Create function to validate event dates
CREATE OR REPLACE FUNCTION public.validate_event_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate start_at is not in the past (for new events)
  IF TG_OP = 'INSERT' AND NEW.start_at < NOW() THEN
    RAISE EXCEPTION 'Data de início não pode ser no passado';
  END IF;
  
  -- Validate end_at is after start_at
  IF NEW.end_at IS NOT NULL AND NEW.start_at IS NOT NULL AND NEW.end_at <= NEW.start_at THEN
    RAISE EXCEPTION 'Data de fim deve ser posterior à data de início';
  END IF;
  
  -- Generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_event_slug(NEW.title, NEW.id);
  ELSE
    -- Validate slug uniqueness
    IF EXISTS (
      SELECT 1 FROM public.events 
      WHERE slug = NEW.slug 
      AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) THEN
      RAISE EXCEPTION 'Slug já existe: %', NEW.slug;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for date validation
DROP TRIGGER IF EXISTS validate_event_dates_trigger ON public.events;
CREATE TRIGGER validate_event_dates_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_dates();

-- Create storage policies for events bucket
CREATE POLICY "Public can view event covers"
ON storage.objects
FOR SELECT
USING (bucket_id = 'events');

CREATE POLICY "Admins can upload event covers"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'events' 
  AND is_admin_user()
);

CREATE POLICY "Admins can update event covers"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'events' 
  AND is_admin_user()
);

CREATE POLICY "Admins can delete event covers"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'events' 
  AND is_admin_user()
);

-- Create admin functions for event management
CREATE OR REPLACE FUNCTION public.admin_create_event(
  p_title text,
  p_slug text,
  p_city text,
  p_venue_id uuid,
  p_start_at timestamp with time zone,
  p_end_at timestamp with time zone,
  p_organizer_id uuid,
  p_cover_url text DEFAULT NULL,
  p_tags text[] DEFAULT '{}',
  p_status text DEFAULT 'active'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_event_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  INSERT INTO public.events (
    title, slug, city, venue_id, start_at, end_at, 
    organizer_id, cover_url, tags, status
  )
  VALUES (
    p_title, p_slug, p_city, p_venue_id, p_start_at, p_end_at,
    p_organizer_id, p_cover_url, p_tags, p_status
  )
  RETURNING id INTO new_event_id;
  
  RETURN new_event_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_event(
  p_event_id uuid,
  p_title text,
  p_slug text,
  p_city text,
  p_venue_id uuid,
  p_start_at timestamp with time zone,
  p_end_at timestamp with time zone,
  p_organizer_id uuid,
  p_cover_url text DEFAULT NULL,
  p_tags text[] DEFAULT '{}',
  p_status text DEFAULT 'active'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.events SET
    title = p_title,
    slug = p_slug,
    city = p_city,
    venue_id = p_venue_id,
    start_at = p_start_at,
    end_at = p_end_at,
    organizer_id = p_organizer_id,
    cover_url = p_cover_url,
    tags = p_tags,
    status = p_status,
    updated_at = now()
  WHERE id = p_event_id;
END;
$function$;

-- Update RLS policies for events
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events new" ON public.events;

CREATE POLICY "Public can view active events"
ON public.events
FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage all events"
ON public.events
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());