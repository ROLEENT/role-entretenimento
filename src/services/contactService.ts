import { supabase } from '@/integrations/supabase/client';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

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
    // Using direct SQL query since contact_messages table is not in types yet
    const { data, error } = await supabase.rpc('get_contact_messages');

    if (error) {
      throw new Error('Erro ao carregar mensagens: ' + error.message);
    }

    return data || [];
  },

  async updateMessageStatus(id: string, status: string) {
    // Using direct SQL query since contact_messages table is not in types yet
    const { error } = await supabase.rpc('update_contact_message_status', {
      p_id: id,
      p_status: status
    });

    if (error) {
      throw new Error('Erro ao atualizar status: ' + error.message);
    }
  }
};