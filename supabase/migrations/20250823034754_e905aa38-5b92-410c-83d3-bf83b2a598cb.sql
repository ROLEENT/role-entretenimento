-- Create organizers table
CREATE TABLE public.organizers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  site TEXT,
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_end TIMESTAMP WITH TIME ZONE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  price_min DECIMAL(10, 2) DEFAULT 0,
  price_max DECIMAL(10, 2),
  image_url TEXT,
  organizer_id UUID REFERENCES public.organizers(id),
  venue_id UUID REFERENCES public.venues(id),
  external_url TEXT,
  status TEXT DEFAULT 'active',
  source TEXT DEFAULT 'internal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_categories table
CREATE TABLE public.event_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, category_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create event_favorites table
CREATE TABLE public.event_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create tickets table (base for future monetization)
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_comments table
CREATE TABLE public.event_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.event_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizers
CREATE POLICY "Anyone can view organizers" ON public.organizers FOR SELECT USING (true);
CREATE POLICY "Admins can manage organizers" ON public.organizers FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for venues
CREATE POLICY "Anyone can view venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Admins can manage venues" ON public.venues FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for events
CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for event_categories
CREATE POLICY "Anyone can view event categories" ON public.event_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage event categories" ON public.event_categories FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for event_favorites
CREATE POLICY "Users can view their own favorites" ON public.event_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON public.event_favorites FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tickets
CREATE POLICY "Anyone can view tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Admins can manage tickets" ON public.tickets FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for event_comments
CREATE POLICY "Anyone can view comments" ON public.event_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.event_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.event_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.event_comments FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_comments_updated_at BEFORE UPDATE ON public.event_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_events_city ON public.events(city);
CREATE INDEX idx_events_date_start ON public.events(date_start);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_venue ON public.events(venue_id);
CREATE INDEX idx_event_favorites_user ON public.event_favorites(user_id);
CREATE INDEX idx_event_favorites_event ON public.event_favorites(event_id);
CREATE INDEX idx_reviews_event ON public.reviews(event_id);
CREATE INDEX idx_event_comments_event ON public.event_comments(event_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_comments;

-- Create function to get nearby events
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