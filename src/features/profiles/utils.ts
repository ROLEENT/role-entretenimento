import { supabase } from "@/integrations/supabase/client";

export async function getSignedAvatarUrl(path: string): Promise<string | null> {
  if (!path) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from('profile-avatars')
      .createSignedUrl(path, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error getting signed avatar URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed avatar URL:', error);
    return null;
  }
}

export async function getSignedCoverUrl(path: string): Promise<string | null> {
  if (!path) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from('profile-covers')
      .createSignedUrl(path, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error getting signed cover URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed cover URL:', error);
    return null;
  }
}