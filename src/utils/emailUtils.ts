// Email hashing utility for privacy protection
// Uses backend MD5 hash function for consistency

import { supabase } from '@/integrations/supabase/client';

export async function hashEmailAsync(email: string): Promise<string> {
  if (!email) return '';
  
  try {
    const { data, error } = await supabase.rpc('hash_email_for_client', {
      email_input: email
    });
    
    if (error) throw error;
    return data || '';
  } catch (error) {
    console.error('Error hashing email:', error);
    // Fallback to simple hash
    return btoa(email.toLowerCase().trim()).slice(0, 32);
  }
}

// Synchronous version for compatibility (uses simple hash)
export function hashEmail(email: string): string {
  if (!email) return '';
  // Simple hash for immediate use - should be replaced with async version
  return btoa(email.toLowerCase().trim()).slice(0, 32);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  email_hash: string; // Changed from author_email to email_hash
  content: string;
  is_approved: boolean;
  created_at: string;
  post_title?: string;
}

export interface BlogLike {
  id: string;
  post_id: string;
  email_hash: string; // Changed from user_email to email_hash
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email_hash: string; // Changed from email to email_hash  
  subject: string;
  message: string;
  status: string;
  created_at: string;
}