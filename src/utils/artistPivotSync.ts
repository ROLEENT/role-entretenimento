import { supabase } from '@/integrations/supabase/client';

// Função para sincronizar artist types (pivot artists_artist_types)
export const syncArtistTypes = async (artistId: string, typeIds: string[]) => {
  try {
    // Primeiro, remove todas as associações existentes
    await supabase
      .from('artists_artist_types')
      .delete()
      .eq('artist_id', artistId);

    // Depois, insere as novas associações
    if (typeIds.length > 0) {
      const insertData = typeIds.map(typeId => ({
        artist_id: artistId,
        type_id: typeId
      }));

      const { error } = await supabase
        .from('artists_artist_types')
        .insert(insertData);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error syncing artist types:', error);
    throw error;
  }
};

// Função para sincronizar genres (pivot artists_genres)
export const syncArtistGenres = async (artistId: string, genreIds: string[]) => {
  try {
    // Primeiro, remove todas as associações existentes
    await supabase
      .from('artists_genres')
      .delete()
      .eq('artist_id', artistId);

    // Depois, insere as novas associações
    if (genreIds.length > 0) {
      const insertData = genreIds.map(genreId => ({
        artist_id: artistId,
        genre_id: genreId
      }));

      const { error } = await supabase
        .from('artists_genres')
        .insert(insertData);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error syncing artist genres:', error);
    throw error;
  }
};

// Função para buscar artist types de um artista
export const getArtistTypes = async (artistId: string) => {
  try {
    const { data, error } = await supabase
      .from('artists_artist_types')
      .select(`
        type_id,
        artist_types!inner(id, name)
      `)
      .eq('artist_id', artistId);

    if (error) throw error;

    return data?.map(item => ({
      id: item.type_id,
      name: (item.artist_types as any).name
    })) || [];
  } catch (error) {
    console.error('Error fetching artist types:', error);
    return [];
  }
};

// Função para buscar genres de um artista
export const getArtistGenres = async (artistId: string) => {
  try {
    const { data, error } = await supabase
      .from('artists_genres')
      .select(`
        genre_id,
        genres!inner(id, name)
      `)
      .eq('artist_id', artistId);

    if (error) throw error;

    return data?.map(item => ({
      id: item.genre_id,
      name: (item.genres as any).name
    })) || [];
  } catch (error) {
    console.error('Error fetching artist genres:', error);
    return [];
  }
};