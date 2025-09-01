import { supabase } from "@/integrations/supabase/client";

/**
 * Upload de avatar para um perfil específico
 * @param profileId ID do perfil (usar auth.uid() para o usuário atual)
 * @param file Arquivo de imagem
 * @returns URL pública da imagem
 */
export async function uploadAvatar(profileId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `avatar-${Date.now()}.${fileExt}`;
  const path = `${profileId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from("profile-avatars")
    .upload(path, file, { 
      upsert: true, 
      cacheControl: "3600" 
    });
  
  if (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from("profile-avatars")
    .getPublicUrl(data.path);
  
  return publicUrlData.publicUrl;
}

/**
 * Upload de capa para um perfil específico
 * @param profileId ID do perfil (usar auth.uid() para o usuário atual)
 * @param file Arquivo de imagem
 * @returns URL pública da imagem
 */
export async function uploadCover(profileId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `cover-${Date.now()}.${fileExt}`;
  const path = `${profileId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from("profile-covers")
    .upload(path, file, { 
      upsert: true, 
      cacheControl: "3600" 
    });
  
  if (error) {
    console.error('Erro ao fazer upload da capa:', error);
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from("profile-covers")
    .getPublicUrl(data.path);
  
  return publicUrlData.publicUrl;
}

/**
 * Deletar avatar do perfil
 * @param profileId ID do perfil
 * @param fileName Nome do arquivo (opcional, se não fornecido deleta toda a pasta)
 */
export async function deleteAvatar(profileId: string, fileName?: string): Promise<void> {
  const path = fileName ? `${profileId}/${fileName}` : `${profileId}/`;
  
  const { error } = await supabase.storage
    .from("avatars")
    .remove([path]);
  
  if (error) {
    console.error('Erro ao deletar avatar:', error);
    throw error;
  }
}

/**
 * Deletar capa do perfil
 * @param profileId ID do perfil
 * @param fileName Nome do arquivo (opcional, se não fornecido deleta toda a pasta)
 */
export async function deleteCover(profileId: string, fileName?: string): Promise<void> {
  const path = fileName ? `${profileId}/${fileName}` : `${profileId}/`;
  
  const { error } = await supabase.storage
    .from("covers")
    .remove([path]);
  
  if (error) {
    console.error('Erro ao deletar capa:', error);
    throw error;
  }
}

/**
 * Listar arquivos de avatar de um perfil
 * @param profileId ID do perfil
 * @returns Lista de arquivos
 */
export async function listAvatars(profileId: string) {
  const { data, error } = await supabase.storage
    .from("avatars")
    .list(profileId, {
      limit: 100,
      sortBy: { column: 'name', order: 'desc' }
    });
  
  if (error) {
    console.error('Erro ao listar avatars:', error);
    throw error;
  }
  
  return data;
}

/**
 * Listar arquivos de capa de um perfil
 * @param profileId ID do perfil
 * @returns Lista de arquivos
 */
export async function listCovers(profileId: string) {
  const { data, error } = await supabase.storage
    .from("covers")
    .list(profileId, {
      limit: 100,
      sortBy: { column: 'name', order: 'desc' }
    });
  
  if (error) {
    console.error('Erro ao listar capas:', error);
    throw error;
  }
  
  return data;
}

/**
 * Validação de arquivo de imagem
 */
export function validateImageFile(file: File, type: 'avatar' | 'cover'): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return 'Arquivo deve ser JPG, PNG ou WebP';
  }

  const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 8 * 1024 * 1024; // 5MB avatar, 8MB cover
  if (file.size > maxSize) {
    return `Arquivo muito grande. Máximo: ${type === 'avatar' ? '5MB' : '8MB'}`;
  }

  return null;
}

/**
 * Validação de dimensões da imagem
 */
export function validateImageDimensions(file: File, type: 'avatar' | 'cover'): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (type === 'avatar') {
        if (img.width < 320 || img.height < 320) {
          resolve('Avatar deve ter pelo menos 320x320px');
        } else {
          resolve(null);
        }
      } else {
        if (img.width < 1920 || img.height < 640) {
          resolve('Capa deve ter pelo menos 1920x640px');
        } else {
          resolve(null);
        }
      }
    };
    img.onerror = () => resolve('Erro ao validar dimensões da imagem');
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Obter URL pública de um arquivo
 * @param bucket Nome do bucket ('profile-avatars' ou 'profile-covers')
 * @param path Caminho do arquivo
 * @returns URL pública
 */
export function getPublicUrl(bucket: 'profile-avatars' | 'profile-covers', path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}