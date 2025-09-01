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
    .from("avatars")
    .upload(path, file, { 
      upsert: true, 
      cacheControl: "3600" 
    });
  
  if (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
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
    .from("covers")
    .upload(path, file, { 
      upsert: true, 
      cacheControl: "3600" 
    });
  
  if (error) {
    console.error('Erro ao fazer upload da capa:', error);
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from("covers")
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
 * Obter URL pública de um arquivo
 * @param bucket Nome do bucket ('avatars' ou 'covers')
 * @param path Caminho do arquivo
 * @returns URL pública
 */
export function getPublicUrl(bucket: 'avatars' | 'covers', path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}