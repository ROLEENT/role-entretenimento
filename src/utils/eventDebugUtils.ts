import { supabase } from '@/integrations/supabase/client';

export const eventDebugUtils = {
  async testCreateEventRPC() {
    try {
      const { data, error } = await supabase.rpc('create_event_cascade', {
        event_data: {
          title: 'Test Event',
          date_start: new Date().toISOString(),
          city: 'Test City',
          status: 'draft'
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async testUserAuth() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return {
          authenticated: false,
          error: error.message
        };
      }

      return {
        authenticated: !!user,
        user
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async checkEventTables() {
    const results = {
      events: { exists: false, count: 0, error: null },
      agenda_itens: { exists: false, count: 0, error: null },
      venues: { exists: false, count: 0, error: null },
      organizers: { exists: false, count: 0, error: null }
    };

    // Check events table
    try {
      const { data, error } = await supabase.from('events').select('id', { count: 'exact', head: true });
      results.events.exists = !error;
      results.events.count = data?.length || 0;
      results.events.error = error?.message || null;
    } catch (error) {
      results.events.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check agenda_itens table
    try {
      const { data, error } = await supabase.from('agenda_itens').select('id', { count: 'exact', head: true });
      results.agenda_itens.exists = !error;
      results.agenda_itens.count = data?.length || 0;
      results.agenda_itens.error = error?.message || null;
    } catch (error) {
      results.agenda_itens.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check venues table
    try {
      const { data, error } = await supabase.from('venues').select('id', { count: 'exact', head: true });
      results.venues.exists = !error;
      results.venues.count = data?.length || 0;
      results.venues.error = error?.message || null;
    } catch (error) {
      results.venues.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check organizers table
    try {
      const { data, error } = await supabase.from('organizers').select('id', { count: 'exact', head: true });
      results.organizers.exists = !error;
      results.organizers.count = data?.length || 0;
      results.organizers.error = error?.message || null;
    } catch (error) {
      results.organizers.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return results;
  },

  validateEventData(data: any) {
    const errors = [];
    
    if (!data.title) errors.push('Title is required');
    if (!data.date_start) errors.push('Start date is required');
    if (!data.city) errors.push('City is required');
    
    if (data.date_start && data.date_end) {
      const start = new Date(data.date_start);
      const end = new Date(data.date_end);
      if (end <= start) {
        errors.push('End date must be after start date');
      }
    }
    
    if (data.price_min && data.price_max && data.price_max < data.price_min) {
      errors.push('Maximum price must be greater than minimum price');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};