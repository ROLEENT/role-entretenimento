-- Add user_id to entity_profiles if not exists and update API
ALTER TABLE public.entity_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_entity_profiles_user_id ON public.entity_profiles(user_id);

-- Update RLS policies for entity_profiles
DROP POLICY IF EXISTS "Users can update their own entity profiles" ON public.entity_profiles;

CREATE POLICY "Users can update their own entity profiles" 
ON public.entity_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update followers table to reference entity_profiles correctly
DROP TABLE IF EXISTS public.followers;

CREATE TABLE public.followers (
  profile_id uuid REFERENCES public.entity_profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (profile_id, user_id)
);

-- Enable RLS on followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Create policies for followers
CREATE POLICY "Anyone can view followers" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can follow profiles" ON public.followers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow profiles" ON public.followers FOR DELETE USING (auth.uid() = user_id);