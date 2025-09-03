import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SelectOption {
  label: string;
  value: string;
  id: string;
  name: string;
}

interface VenueDetails {
  id: string;
  name: string;
  address_line?: string;
  district?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  about?: string;
  tags?: string[];
  cover_url?: string;
  cover_alt?: string;
}

export const useVenuesOptions = () => {
  const [loading, setLoading] = useState(false);

  const searchVenues = async (query: string): Promise<SelectOption[]> => {
    setLoading(true);
    try {
      const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
      const { data, error } = await supabase.functions.invoke(`options/venues${queryParams}`, {
        method: 'GET',
      });

      if (error) {
        console.error('Error searching venues:', error);
        return [];
      }

      return (data?.items || []).map(item => ({
        label: `${item.name}${item.city ? ` - ${item.city}` : ''}`,
        value: item.id,
        id: item.id,
        name: item.name
      }));
    } catch (error) {
      console.error('Error searching venues:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getVenueDetails = async (venueId: string): Promise<VenueDetails | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(`options/venues?id=${venueId}`, {
        method: 'GET',
      });

      if (error) {
        console.error('Error fetching venue details:', error);
        return null;
      }

      return data?.venue || null;
    } catch (error) {
      console.error('Error fetching venue details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createVenue = async (name: string): Promise<SelectOption> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('options/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      if (error) {
        console.error('Error creating venue:', error);
        throw error;
      }

      return {
        label: `${data.name}${data.city ? ` - ${data.city}` : ''}`,
        value: data.id,
        id: data.id,
        name: data.name
      };
    } catch (error) {
      console.error('Error creating venue:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchVenues,
    createVenue,
    getVenueDetails,
    loading,
  };
};