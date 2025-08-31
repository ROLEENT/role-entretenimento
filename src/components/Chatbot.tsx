import React, { useRef, useEffect, useState } from 'react';
import { MessageCircle, X, Send, Trash2, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChatbot } from '@/hooks/useChatbot';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date_start: string;
    city?: string;
    image_url?: string;
    price_min?: number;
    price_max?: number;
    external_url?: string;
    organizer?: {
      name: string;
    };
    venue?: {
      name: string;
    };
    venues?: {
      name: string;
    };
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventDate = new Date(event.date_start);
  const formattedDate = formatDistanceToNow(eventDate, { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {event.image_url && (
            <div className="flex-shrink-0">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-16 h-16 object-cover rounded-md"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm line-clamp-2 mb-1">
              {event.title}
            </h4>
            
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
              {event.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{event.city}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
              {(event.price_min !== null || event.price_max !== null) && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>
                    {event.price_min === 0 ? 'Grátis' : 
                     event.price_min === event.price_max ? `R$ ${event.price_min}` :
                     `R$ ${event.price_min || 0} - ${event.price_max || '?'}`}
                  </span>
                </div>
              )}
            </div>

            {event.venues?.name && (
              <Badge variant="secondary" className="text-xs mb-2">
                {event.venues.name}
              </Badge>
            )}

            {event.external_url && (
              <Button 
                size="sm" 
                className="text-xs h-7"
                onClick={() => window.open(event.external_url, '_blank')}
              >
                Ver Evento
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    events?: Array<{
      id: string;
      title: string;
      date_start: string;
      city?: string;
      image_url?: string;
    }>;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-4' 
            : 'bg-muted mr-4'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {message.events && message.events.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs opacity-75 font-medium">
              Eventos encontrados:
            </p>
            {message.events.slice(0, 3).map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
            {message.events.length > 3 && (
              <p className="text-xs opacity-75">
                +{message.events.length - 3} eventos encontrados
              </p>
            )}
          </div>
        )}
        
        <div className="text-xs opacity-50 mt-1">
          {formatDistanceToNow(message.timestamp, { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </div>
      </div>
    </div>
  );
};

export const Chatbot: React.FC = () => {
  const { messages, isLoading, isOpen, sendMessage, toggleChat, clearChat } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 p-0"
        size="sm"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-xl z-40 border">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Assistente ROLÊ
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[436px]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-1">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-muted rounded-2xl px-4 py-2 mr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                        </div>
                        <span className="text-sm">Digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pergunte sobre eventos, shows, exposições ou qualquer atividade cultural! 🎭
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};