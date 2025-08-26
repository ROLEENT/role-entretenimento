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

-- Update blog_comments
UPDATE public.blog_comments 
SET email_hash = generate_email_hash(author_email)
WHERE author_email IS NOT NULL AND email_hash IS NULL;

-- Update blog_likes  
UPDATE public.blog_likes 
SET email_hash = generate_email_hash(user_email)
WHERE user_email IS NOT NULL AND email_hash IS NULL;

-- Update contact_messages (assuming it has an email field - will check structure)
-- Note: contact_messages might not have direct email field, checking structure first
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

-- Step 4: Update functions that use email fields
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

-- Update get_blog_comments_admin to return email_hash instead of email
CREATE OR REPLACE FUNCTION public.get_blog_comments_admin_hash()
RETURNS TABLE(
  id uuid, 
  post_id uuid, 
  author_name text, 
  email_hash text, 
  content text, 
  is_approved boolean, 
  created_at timestamp with time zone, 
  post_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    bc.id,
    bc.post_id,
    bc.author_name,
    bc.email_hash,
    bc.content,
    bc.is_approved,
    bc.created_at,
    bp.title as post_title
  FROM public.blog_comments bc
  LEFT JOIN public.blog_posts bp ON bc.post_id = bp.id
  ORDER BY bc.created_at DESC;
END;
$$;

-- Step 5: Add constraints and indexes on email_hash fields
-- Make email_hash NOT NULL for new records
ALTER TABLE public.blog_comments 
ALTER COLUMN email_hash SET DEFAULT '';

ALTER TABLE public.blog_likes 
ALTER COLUMN email_hash SET DEFAULT '';

ALTER TABLE public.contact_messages 
ALTER COLUMN email_hash SET DEFAULT '';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_email_hash 
ON public.blog_comments(email_hash);

CREATE INDEX IF NOT EXISTS idx_blog_likes_email_hash 
ON public.blog_likes(email_hash);

CREATE INDEX IF NOT EXISTS idx_blog_likes_post_email 
ON public.blog_likes(post_id, email_hash);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email_hash 
ON public.contact_messages(email_hash);

-- Step 6: Create helper function for frontend to generate email hash
CREATE OR REPLACE FUNCTION public.hash_email_for_client(email_input TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT encode(digest(lower(trim(email_input)), 'sha256'), 'hex');
$$;

-- Note: We're keeping the original email columns for now to ensure no data loss
-- In a follow-up migration, after confirming everything works, we can:
-- 1. Make email_hash NOT NULL
-- 2. Drop the original email columns
-- 3. Update any remaining functions

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
    (SELECT COUNT(*) FROM public.blog_comments WHERE author_email IS NOT NULL)::bigint,
    (SELECT COUNT(*) FROM public.blog_comments WHERE email_hash IS NOT NULL AND email_hash != '')::bigint,
    (SELECT COUNT(*) FROM public.blog_comments WHERE author_email IS NOT NULL) = 
    (SELECT COUNT(*) FROM public.blog_comments WHERE email_hash IS NOT NULL AND email_hash != '')
  ;
  
  -- Check blog_likes
  RETURN QUERY
  SELECT 
    'blog_likes'::text,
    (SELECT COUNT(*) FROM public.blog_likes)::bigint,
    (SELECT COUNT(*) FROM public.blog_likes WHERE user_email IS NOT NULL)::bigint,
    (SELECT COUNT(*) FROM public.blog_likes WHERE email_hash IS NOT NULL AND email_hash != '')::bigint,
    (SELECT COUNT(*) FROM public.blog_likes WHERE user_email IS NOT NULL) = 
    (SELECT COUNT(*) FROM public.blog_likes WHERE email_hash IS NOT NULL AND email_hash != '')
  ;
  
  -- Check contact_messages (if email column exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_messages' AND column_name = 'email'
  ) THEN
    RETURN QUERY
    SELECT 
      'contact_messages'::text,
      (SELECT COUNT(*) FROM public.contact_messages)::bigint,
      (SELECT COUNT(*) FROM public.contact_messages WHERE email IS NOT NULL)::bigint,
      (SELECT COUNT(*) FROM public.contact_messages WHERE email_hash IS NOT NULL AND email_hash != '')::bigint,
      (SELECT COUNT(*) FROM public.contact_messages WHERE email IS NOT NULL) = 
      (SELECT COUNT(*) FROM public.contact_messages WHERE email_hash IS NOT NULL AND email_hash != '')
    ;
  END IF;
END;
$$;