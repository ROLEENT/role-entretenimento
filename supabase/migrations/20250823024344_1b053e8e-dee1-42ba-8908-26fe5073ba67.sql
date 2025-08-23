-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for article status
CREATE TYPE public.article_status AS ENUM ('draft', 'published', 'scheduled');

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'moderator');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role user_role NOT NULL DEFAULT 'editor',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  slug_data TEXT NOT NULL, -- ex: "14-17-agosto"
  city TEXT NOT NULL CHECK (city IN ('porto-alegre', 'florianopolis', 'curitiba', 'sao-paulo', 'rio-de-janeiro')),
  author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  summary TEXT NOT NULL,
  content_html TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  reading_time INTEGER DEFAULT 5,
  featured BOOLEAN DEFAULT FALSE,
  status article_status NOT NULL DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(city, slug_data)
);

-- Create categories table for tags
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Editors can insert own posts" ON public.blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts" ON public.blog_posts
  FOR UPDATE USING (auth.uid() = author_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete posts" ON public.blog_posts
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Storage policies for blog images
CREATE POLICY "Anyone can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their blog images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'editor'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial categories
INSERT INTO public.categories (name, slug, description, color) VALUES
  ('Música', 'musica', 'Eventos e shows musicais', '#8B5CF6'),
  ('Arte', 'arte', 'Exposições e eventos artísticos', '#F59E0B'),
  ('Festa', 'festa', 'Festas e baladas', '#EF4444'),
  ('Cultura', 'cultura', 'Eventos culturais', '#10B981'),
  ('Gastronomia', 'gastronomia', 'Eventos gastronômicos', '#F97316');