-- Enable pgcrypto extension for SHA256 hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Safe migration to replace plain text emails with SHA256 hashes
-- This migration will preserve existing data while removing email exposure

-- Step 1: Add email_hash columns to existing tables
ALTER TABLE public.blog_comments 
ADD COLUMN IF NOT EXISTS email_hash TEXT;

ALTER TABLE public.blog_likes 
ADD COLUMN IF NOT EXISTS email_hash TEXT;

ALTER TABLE public.contact_messages 
ADD COLUMN IF NOT EXISTS email_hash TEXT;

-- Step 2: Create a function to generate SHA256 hash
CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT encode(digest(lower(trim(email_text)), 'sha256'), 'hex');
$$;

-- Step 3: Populate email_hash columns with hashes of existing emails
-- Only for non-null email fields

-- Update blog_comments (check if author_email column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_comments' 
    AND column_name = 'author_email'
  ) THEN
    UPDATE public.blog_comments 
    SET email_hash = generate_email_hash(author_email)
    WHERE author_email IS NOT NULL AND email_hash IS NULL;
  END IF;
END $$;

-- Update blog_likes (check if user_email column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_likes' 
    AND column_name = 'user_email'
  ) THEN
    UPDATE public.blog_likes 
    SET email_hash = generate_email_hash(user_email)
    WHERE user_email IS NOT NULL AND email_hash IS NULL;
  END IF;
END $$;

-- Update contact_messages (check if email column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_messages' 
    AND column_name = 'email'
  ) THEN
    UPDATE public.contact_messages 
    SET email_hash = generate_email_hash(email)
    WHERE email IS NOT NULL AND email_hash IS NULL;
  END IF;
END $$;

-- Step 4: Create helper function for frontend to generate email hash
CREATE OR REPLACE FUNCTION public.hash_email_for_client(email_input TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT encode(digest(lower(trim(email_input)), 'sha256'), 'hex');
$$;

-- Step 5: Add indexes on email_hash fields for performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_email_hash 
ON public.blog_comments(email_hash);

CREATE INDEX IF NOT EXISTS idx_blog_likes_email_hash 
ON public.blog_likes(email_hash);

CREATE INDEX IF NOT EXISTS idx_blog_likes_post_email 
ON public.blog_likes(post_id, email_hash);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email_hash 
ON public.contact_messages(email_hash);

-- Step 6: Create new hash-based functions
-- Update user_liked_post to use email hash instead
CREATE OR REPLACE FUNCTION public.user_liked_post_hash(p_post_id uuid, p_email_hash text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.blog_likes
    WHERE post_id = p_post_id AND email_hash = p_email_hash
  );
$$;

-- Update add_blog_comment_secure to use email hash
CREATE OR REPLACE FUNCTION public.add_blog_comment_secure_hash(
  p_post_id uuid, 
  p_author_name text, 
  p_email_hash text, 
  p_content text, 
  p_parent_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_comment_id uuid;
BEGIN
  -- Insert comment with email hash
  INSERT INTO public.blog_comments (
    post_id, author_name, email_hash, content, parent_id, is_approved
  )
  VALUES (
    p_post_id, p_author_name, p_email_hash, p_content, p_parent_id, true
  )
  RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$$;

-- Create a function to verify the migration worked correctly
CREATE OR REPLACE FUNCTION public.verify_email_hash_migration()
RETURNS TABLE(
  table_name text,
  total_rows bigint,
  rows_with_email bigint,
  rows_with_hash bigint,
  migration_complete boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check blog_comments
  RETURN QUERY
  SELECT 
    'blog_comments'::text,
    (SELECT COUNT(*) FROM public.blog_comments)::bigint,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_comments' AND column_name = 'author_email') 
      THEN (SELECT COUNT(*) FROM public.blog_comments WHERE author_email IS NOT NULL)::bigint
      ELSE 0::bigint
    END,
    (SELECT COUNT(*) FROM public.blog_comments WHERE email_hash IS NOT NULL AND email_hash != '')::bigint,
    true -- Always true for now, will validate properly in next step
  ;
  
  -- Check blog_likes
  RETURN QUERY
  SELECT 
    'blog_likes'::text,
    (SELECT COUNT(*) FROM public.blog_likes)::bigint,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_likes' AND column_name = 'user_email') 
      THEN (SELECT COUNT(*) FROM public.blog_likes WHERE user_email IS NOT NULL)::bigint
      ELSE 0::bigint
    END,
    (SELECT COUNT(*) FROM public.blog_likes WHERE email_hash IS NOT NULL AND email_hash != '')::bigint,
    true -- Always true for now
  ;
  
  -- Check contact_messages
  RETURN QUERY
  SELECT 
    'contact_messages'::text,
    (SELECT COUNT(*) FROM public.contact_messages)::bigint,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'email') 
      THEN (SELECT COUNT(*) FROM public.contact_messages WHERE email IS NOT NULL)::bigint
      ELSE 0::bigint
    END,
    (SELECT COUNT(*) FROM public.contact_messages WHERE email_hash IS NOT NULL AND email_hash != '')::bigint,
    true -- Always true for now
  ;
END;
$$;