import { supabase } from "@/integrations/supabase/client";

export async function uploadAvatar(profileId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `avatar-${Date.now()}.${fileExt}`;
  const filePath = `${profileId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from("profile-avatars")
    .upload(filePath, file, { 
      upsert: true, 
      cacheControl: "3600" 
    });
    
  if (error) throw error;
  
  const { data: publicUrl } = supabase.storage
    .from("profile-avatars")
    .getPublicUrl(data.path);
    
  return publicUrl.publicUrl;
}

export async function uploadCover(profileId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `cover-${Date.now()}.${fileExt}`;
  const filePath = `${profileId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from("profile-covers")
    .upload(filePath, file, { 
      upsert: true, 
      cacheControl: "3600" 
    });
    
  if (error) throw error;
  
  const { data: publicUrl } = supabase.storage
    .from("profile-covers")
    .getPublicUrl(data.path);
    
  return publicUrl.publicUrl;
}

export async function deleteAvatar(profileId: string) {
  const { data: files } = await supabase.storage
    .from("profile-avatars")
    .list(profileId);
    
  if (files && files.length > 0) {
    const filePaths = files.map(file => `${profileId}/${file.name}`);
    await supabase.storage
      .from("profile-avatars")
      .remove(filePaths);
  }
}

export async function deleteCover(profileId: string) {
  const { data: files } = await supabase.storage
    .from("profile-covers")
    .list(profileId);
    
  if (files && files.length > 0) {
    const filePaths = files.map(file => `${profileId}/${file.name}`);
    await supabase.storage
      .from("profile-covers")
      .remove(filePaths);
  }
}

export function validateImageFile(file: File, maxSize: number = 5 * 1024 * 1024) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPG ou PNG.');
  }
  
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    throw new Error(`Arquivo muito grande. Máximo ${maxMB}MB.`);
  }
}

export function validateImageDimensions(file: File, minWidth: number, minHeight: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < minWidth || img.height < minHeight) {
        reject(new Error(`Dimensões mínimas: ${minWidth}x${minHeight}px`));
      } else {
        resolve();
      }
    };
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}