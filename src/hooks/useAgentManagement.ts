import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AgentFormValues } from '@/lib/agentSchema';

// Map agent types to database tables
const TABLE_BY_TYPE = {
  artist: 'artists',
  venue: 'venues', 
  organizer: 'organizers'
} as const;

export const useAgentManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkSlugExists = async (slug: string, agentType?: string): Promise<boolean> => {
    try {
      if (agentType) {
        // Check only in specific table
        const tableName = TABLE_BY_TYPE[agentType as keyof typeof TABLE_BY_TYPE];
        const { data } = await supabase
          .from(tableName)
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        return !!data;
      }

      // Check in all tables if type not specified
      const [artistResult, venueResult, organizerResult] = await Promise.all([
        supabase.from('artists').select('id').eq('slug', slug).maybeSingle(),
        supabase.from('venues').select('id').eq('slug', slug).maybeSingle(),
        supabase.from('organizers').select('id').eq('slug', slug).maybeSingle(),
      ]);

      return !!(artistResult.data || venueResult.data || organizerResult.data);
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  };

  const createAgent = async (data: AgentFormValues): Promise<string | null> => {
    setLoading(true);
    try {
      // Check if slug already exists for this specific type
      const slugExists = await checkSlugExists(data.slug, data.type);
      if (slugExists) {
        toast({
          title: "Slug duplicado",
          description: "Este slug já está em uso. Escolha outro.",
          variant: "destructive"
        });
        return null;
      }

      let insertData: any = {};
      
      // Prepare data based on agent type and align with actual database columns
      switch (data.type) {
        case 'artist':
          insertData = {
            stage_name: data.name,
            slug: data.slug,
            city_id: data.city_id || null,
            instagram: data.instagram?.replace(/^@+/, '') || '',
            booking_whatsapp: data.whatsapp || '',
            booking_email: data.email || '',
            website_url: data.website || null,
            bio_short: data.bio_short || '',
            status: data.status || 'draft',
            artist_type: data.artist_subtype || 'banda',
            spotify_url: data.spotify_url || null,
            soundcloud_url: data.soundcloud_url || null,
            youtube_url: data.youtube_url || null,
            beatport_url: data.beatport_url || null,
            profile_image_url: data.profile_image_url || '',
            presskit_url: data.presskit_url || null,
          };
          break;

        case 'venue':
          insertData = {
            name: data.name,
            slug: data.slug,
            address: data.address || '',
            city_id: data.city_id || null,
            state: 'SP', // Default value
            capacity: data.capacity || null,
            venue_type_id: data.venue_type_id || null,
            lat: data.lat || null,
            lng: data.lng || null,
            contacts_json: {
              instagram: data.instagram?.replace(/^@+/, '') || '',
              whatsapp: data.whatsapp || '',
              email: data.email || '',
              website: data.website || null,
            }
          };
          break;

        case 'organizer':
          insertData = {
            name: data.name,
            slug: data.slug,
            city_id: data.city_id || null,
            instagram: data.instagram?.replace(/^@+/, '') || '',
            contact_whatsapp: data.whatsapp || '',
            contact_email: data.email || '',
            site: data.website || null,
            bio_short: data.bio_short || '',
            status: data.status || 'draft',
            type: data.organizer_subtype || 'organizador',
            booking_email: data.booking_email || null,
            booking_whatsapp: data.booking_whatsapp || null,
          };
          break;

        default:
          throw new Error('Invalid agent type');
      }

      // Insert into the correct table
      const tableName = TABLE_BY_TYPE[data.type];
      const result = await supabase
        .from(tableName)
        .insert(insertData)
        .select('id')
        .single();

      if (result.error) throw result.error;

      const typeLabels = {
        artist: 'Artista',
        venue: 'Local', 
        organizer: 'Organizador'
      };

      toast({
        title: "Sucesso",
        description: `${typeLabels[data.type]} criado com sucesso!`
      });

      return result.data.id;
    } catch (error: any) {
      console.error('Error creating agent:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Slug duplicado",
          description: "Este slug já está em uso.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao criar agente. Tente novamente.",
          variant: "destructive"
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createAgent,
    checkSlugExists,
  };
};