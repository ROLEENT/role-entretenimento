import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ArtistWithRelations {
  id: string;
  stage_name: string;
  genres: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}

export function useArtistWithRelations(artistId?: string) {
  return useQuery({
    queryKey: ['artist-relations', artistId],
    queryFn: async () => {
      if (!artistId) return null;

      // Get artist data
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('id, stage_name')
        .eq('id', artistId)
        .single();

      if (artistError) throw artistError;

      // Get artist genres
      const { data: genreRelations, error: genreError } = await supabase
        .from('artist_genres')
        .select(`
          genre_id,
          genres (
            id,
            name
          )
        `)
        .eq('artist_id', artistId);

      if (genreError) throw genreError;

      // Get artist roles
      const { data: roleRelations, error: roleError } = await supabase
        .from('artist_roles')
        .select(`
          role_id,
          artist_roles_lookup (
            id,
            name
          )
        `)
        .eq('artist_id', artistId);

      if (roleError) throw roleError;

      return {
        ...artist,
        genres: genreRelations?.map(rel => rel.genres).filter(Boolean) || [],
        roles: roleRelations?.map(rel => rel.artist_roles_lookup).filter(Boolean) || [],
      };
    },
    enabled: !!artistId,
  });
}

export function useUpdateArtistRelations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artistId,
      genreIds,
      roleIds,
    }: {
      artistId: string;
      genreIds: string[];
      roleIds: string[];
    }) => {
      // Clear existing relations
      await supabase.from('artist_genres').delete().eq('artist_id', artistId);
      await supabase.from('artist_roles').delete().eq('artist_id', artistId);

      // Insert new genre relations
      if (genreIds.length > 0) {
        const { error: genreError } = await supabase
          .from('artist_genres')
          .insert(genreIds.map(genreId => ({ artist_id: artistId, genre_id: genreId })));
        
        if (genreError) throw genreError;
      }

      // Insert new role relations
      if (roleIds.length > 0) {
        const { error: roleError } = await supabase
          .from('artist_roles')
          .insert(roleIds.map(roleId => ({ artist_id: artistId, role_id: roleId })));
        
        if (roleError) throw roleError;
      }
    },
    onSuccess: (_, { artistId }) => {
      queryClient.invalidateQueries({ queryKey: ['artist-relations', artistId] });
      toast.success('Gêneros e funções atualizados com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar relações: ' + error.message);
    },
  });
}