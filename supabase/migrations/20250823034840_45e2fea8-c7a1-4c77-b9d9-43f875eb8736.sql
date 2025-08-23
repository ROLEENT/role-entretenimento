-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.get_nearby_events(lat DECIMAL, lng DECIMAL, radius_km INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  date_start TIMESTAMP WITH TIME ZONE,
  date_end TIMESTAMP WITH TIME ZONE,
  city TEXT,
  state TEXT,
  price_min DECIMAL,
  price_max DECIMAL,
  image_url TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_lat DECIMAL,
  venue_lng DECIMAL,
  distance_km DECIMAL
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.id,
    e.title,
    e.description,
    e.date_start,
    e.date_end,
    e.city,
    e.state,
    e.price_min,
    e.price_max,
    e.image_url,
    v.name as venue_name,
    v.address as venue_address,
    v.lat as venue_lat,
    v.lng as venue_lng,
    (6371 * acos(cos(radians(lat)) * cos(radians(v.lat)) * cos(radians(v.lng) - radians(lng)) + sin(radians(lat)) * sin(radians(v.lat)))) as distance_km
  FROM public.events e
  LEFT JOIN public.venues v ON e.venue_id = v.id
  WHERE e.status = 'active'
    AND v.lat IS NOT NULL 
    AND v.lng IS NOT NULL
    AND (6371 * acos(cos(radians(lat)) * cos(radians(v.lat)) * cos(radians(v.lng) - radians(lng)) + sin(radians(lat)) * sin(radians(v.lat)))) <= radius_km
  ORDER BY distance_km;
$$;