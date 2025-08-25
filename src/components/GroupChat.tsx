import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Send, Trash2 } from 'lucide-react';
import { useGroupChat, GroupMessage } from '@/hooks/useGroupChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GroupChatProps {
  groupId: string;
  groupName: string;
}

export const GroupChat = ({ groupId, groupName }: GroupChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { messages, loading, sendMessage, deleteMessage } = useGroupChat(groupId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Chat do {groupName}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {loading && messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Carregando mensagens...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma mensagem ainda. Seja o primeiro a conversar!
              </div>
            ) : (
              messages.map((message: GroupMessage) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwner={user?.id === message.user_id}
                  onDelete={handleDeleteMessage}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              maxLength={500}
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

interface MessageItemProps {
  message: GroupMessage;
  isOwner: boolean;
  onDelete: (messageId: string) => void;
}

const MessageItem = ({ message, isOwner, onDelete }: MessageItemProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className={`flex space-x-3 ${isOwner ? 'flex-row-reverse space-x-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.profile?.avatar_url} />
        <AvatarFallback className="text-xs">
          {message.profile?.display_name?.[0] || message.profile?.username?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 ${isOwner ? 'text-right' : ''}`}>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium">
            {message.profile?.display_name || message.profile?.username || 'Usuário'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
          {isOwner && showActions && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
              onClick={() => onDelete(message.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className={`
          inline-block max-w-xs lg:max-w-md xl:max-w-lg px-3 py-2 rounded-lg text-sm
          ${isOwner 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
          }
        `}>
          {message.content}
        </div>
      </div>
    </div>
  );
};