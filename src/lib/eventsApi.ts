import { supabase } from '@/integrations/supabase/client';

export const eventsApi = {
  async deleteEvent(eventId: string) {
    try {
      // Get admin session
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = session?.user?.email;
      
      if (!adminEmail) {
        throw new Error('Admin não autenticado');
      }

      // Use the admin_delete_event function with proper authentication
      const { data, error } = await supabase.rpc('admin_delete_event', {
        p_admin_email: adminEmail,
        p_event_id: eventId
      });

      if (error) {
        throw new Error(`Erro ao excluir evento: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  }
};