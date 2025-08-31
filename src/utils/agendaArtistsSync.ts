import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AgendaArtistsSyncOptions {
  agendaId: string;
  artistIds: string[];
}

export async function syncAgendaArtists({ agendaId, artistIds }: AgendaArtistsSyncOptions) {
  try {
    // First, remove all existing artist associations for this agenda item
    const { error: deleteError } = await supabase
      .from('agenda_item_artists')
      .delete()
      .eq('agenda_id', agendaId);

    if (deleteError) {
      console.error('Error removing existing artists:', deleteError);
      throw new Error('Erro ao remover artistas existentes');
    }

    // If there are no artists to add, we're done
    if (!artistIds || artistIds.length === 0) {
      return { success: true };
    }

    // Insert new artist associations
    const artistAssociations = artistIds.map((artistId, index) => ({
      agenda_id: agendaId,
      artist_id: artistId,
      position: index,
      headliner: index === 0, // First artist is considered headliner
      role: index === 0 ? 'headliner' : 'support',
    }));

    const { error: insertError } = await supabase
      .from('agenda_item_artists')
      .insert(artistAssociations);

    if (insertError) {
      console.error('Error inserting new artists:', insertError);
      throw new Error('Erro ao associar artistas ao evento');
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing agenda artists:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao sincronizar artistas');
    return { success: false, error };
  }
}

export async function getAgendaArtists(agendaId: string) {
  try {
    const { data, error } = await supabase
      .from('agenda_item_artists')
      .select(`
        *,
        artists:artist_id (
          id,
          stage_name,
          city,
          profile_image_url
        )
      `)
      .eq('agenda_id', agendaId)
      .order('position');

    if (error) {
      console.error('Error fetching agenda artists:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching agenda artists:', error);
    return [];
  }
}