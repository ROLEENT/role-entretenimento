-- Add city_id columns to artists, venues, and organizers tables
ALTER TABLE public.artists ADD COLUMN city_id INTEGER REFERENCES public.cities(id);
ALTER TABLE public.venues ADD COLUMN city_id INTEGER REFERENCES public.cities(id);
ALTER TABLE public.organizers ADD COLUMN city_id INTEGER REFERENCES public.cities(id);

-- Update existing records to map city names to city_id
UPDATE public.artists 
SET city_id = (
  SELECT c.id FROM public.cities c 
  WHERE LOWER(c.name) = LOWER(artists.city) 
  LIMIT 1
) 
WHERE city IS NOT NULL;

UPDATE public.venues 
SET city_id = (
  SELECT c.id FROM public.cities c 
  WHERE LOWER(c.name) = LOWER(venues.city) 
  LIMIT 1
) 
WHERE city IS NOT NULL;

-- Update any organizers that might have city data
UPDATE public.organizers 
SET city_id = (
  SELECT c.id FROM public.cities c 
  WHERE LOWER(c.name) = LOWER(organizers.city) 
  LIMIT 1
) 
WHERE city IS NOT NULL;