import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  events?: any[];
}

interface UseChatbotReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  sendMessage: (message: string) => Promise<void>;
  toggleChat: () => void;
  clearChat: () => void;
}

export const useChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Oi! 👋 Sou seu assistente para encontrar eventos culturais. Como posso te ajudar hoje? Você pode me perguntar sobre shows, exposições, festas ou qualquer evento que está procurando!',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get user location if available
      let userLocation = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false
            });
          });
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        } catch (error) {
          console.log('Geolocation not available:', error);
        }
      }

      // Prepare chat history for AI context
      const chatHistory = messages
        .slice(-6) // Last 6 messages for context
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Call AI chatbot edge function
      const { data, error } = await supabase.functions.invoke('ai-chatbot', {
        body: {
          message: message.trim(),
          chatHistory,
          userLocation
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro na comunicação com o chatbot');
      }

      if (!data?.message) {
        throw new Error('Resposta inválida do chatbot');
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        events: data.events || undefined
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro no chatbot:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns segundos ou use a busca manual de eventos. 😅',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat limpo! Como posso te ajudar a encontrar eventos? 🎭',
        timestamp: new Date(),
      }
    ]);
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    sendMessage,
    toggleChat,
    clearChat
  };
};