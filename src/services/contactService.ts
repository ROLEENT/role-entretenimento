import { supabase } from '@/integrations/supabase/client';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Helper function to hash email client-side for privacy
const hashEmail = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const contactService = {
  async sendMessage(messageData: ContactMessage) {
    // Using direct SQL query since contact_messages table is not in types yet
    const { error } = await supabase.rpc('insert_contact_message', {
      p_name: messageData.name,
      p_email: messageData.email,
      p_subject: messageData.subject,
      p_message: messageData.message
    });

    if (error) {
      throw new Error('Erro ao enviar mensagem: ' + error.message);
    }
  },

  async getAllMessages() {
    const { data, error } = await supabase.rpc('get_contact_messages');

    if (error) {
      throw new Error('Erro ao carregar mensagens: ' + error.message);
    }

    return data || [];
  },

  async markAsHandled(id: string) {
    const { error } = await supabase.rpc('mark_contact_message_handled', {
      p_id: id
    });

    if (error) {
      throw new Error('Erro ao marcar como tratada: ' + error.message);
    }
  },

  async markAsUnhandled(id: string) {
    const { error } = await supabase.rpc('mark_contact_message_unhandled', {
      p_id: id
    });

    if (error) {
      throw new Error('Erro ao marcar como não tratada: ' + error.message);
    }
  }
};