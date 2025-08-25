import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar, MapPin, Users, MessageCircle, Phone, ExternalLink } from 'lucide-react';
import { CompanionRequest } from '@/hooks/useEventCompanions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompanionRequestCardProps {
  request: CompanionRequest;
  onRespond?: (requestId: string) => void;
  onEdit?: (requestId: string) => void;
  onDelete?: (requestId: string) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

export const CompanionRequestCard = ({ 
  request, 
  onRespond, 
  onEdit, 
  onDelete,
  showActions = true,
  isOwner = false
}: CompanionRequestCardProps) => {
  const getContactIcon = (preference: string) => {
    switch (preference) {
      case 'whatsapp':
        return <Phone className="h-4 w-4" />;
      case 'telegram':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getContactLabel = (preference: string) => {
    switch (preference) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'telegram':
        return 'Telegram';
      default:
        return 'Pelo app';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.profile?.avatar_url} />
              <AvatarFallback>
                {request.profile?.display_name?.[0] || request.profile?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {request.profile?.display_name || request.profile?.username || 'Usuário'}
              </CardTitle>
              {request.event && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(request.event.date_start).toLocaleDateString()}</span>
                  <MapPin className="h-3 w-3" />
                  <span>{request.event.city}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant={request.is_active ? "default" : "secondary"}>
            {request.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {request.event && (
          <div className="mb-3">
            <h4 className="font-medium text-sm mb-1">{request.event.title}</h4>
          </div>
        )}

        {request.message && (
          <CardDescription className="mb-4">
            "{request.message}"
          </CardDescription>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>
              Procura {request.companions_needed} 
              {request.companions_needed === 1 ? ' pessoa' : ' pessoas'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {getContactIcon(request.contact_preference)}
            <span>Contato: {getContactLabel(request.contact_preference)}</span>
            {request.contact_info && request.contact_preference !== 'app' && (
              <Badge variant="outline" className="text-xs">
                {request.contact_info}
              </Badge>
            )}
          </div>

          <div className="text-xs">
            Publicado {formatDistanceToNow(new Date(request.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2 mt-4 pt-4 border-t">
            {isOwner ? (
              <>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(request.id)}>
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={() => onDelete(request.id)}>
                    Remover
                  </Button>
                )}
              </>
            ) : (
              onRespond && (
                <Button size="sm" onClick={() => onRespond(request.id)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Responder
                </Button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};