-- Update claim profile system to work with new profiles table
-- Add verification workflow and notification system

-- Create profile claim requests table for tracking claims
CREATE TABLE IF NOT EXISTS public.profile_claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  verification_method TEXT NOT NULL DEFAULT 'email', -- 'email', 'phone', 'document'
  verification_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification requests table for admin approval
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  verification_type TEXT NOT NULL DEFAULT 'identity', -- 'identity', 'business', 'artist'
  documents JSONB DEFAULT '[]', -- Array of document URLs and types
  social_proof JSONB DEFAULT '{}', -- Social media links, follower counts, etc
  business_info JSONB DEFAULT '{}', -- Business registration, tax ID, etc
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_info'
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'profile_claim', 'verification_request', 'content_report', etc
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_read BOOLEAN DEFAULT FALSE,
  admin_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profile_claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_claim_requests
CREATE POLICY "Admins can manage all claim requests" ON public.profile_claim_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );

CREATE POLICY "Users can view their own claim requests" ON public.profile_claim_requests
  FOR SELECT USING (
    requester_email = auth.email()
  );

-- RLS Policies for verification_requests
CREATE POLICY "Admins can manage verification requests" ON public.verification_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );

CREATE POLICY "Users can create verification requests for their profiles" ON public.verification_requests
  FOR INSERT WITH CHECK (
    requested_by = auth.uid() AND
    profile_user_id = auth.uid()
  );

CREATE POLICY "Users can view their own verification requests" ON public.verification_requests
  FOR SELECT USING (
    requested_by = auth.uid()
  );

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can manage their notifications" ON public.admin_notifications
  FOR ALL USING (
    admin_email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = admin_email AND is_active = true
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_claim_requests_profile_user_id ON public.profile_claim_requests(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_claim_requests_status ON public.profile_claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_profile_user_id ON public.verification_requests(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_email ON public.admin_notifications(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);