import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Star, Crown, ExternalLink, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/alert-dialog-confirm";

interface AdminEventCardV3Props {
  event: {
    id: string;
    title: string;
    subtitle?: string;
    summary?: string;
    city?: string;
    location_name?: string;
    date_start?: string;
    date_end?: string;
    doors_open_utc?: string;
    image_url?: string;
    cover_url?: string;
    price_min?: number;
    price_max?: number;
    currency?: string;
    highlight_type?: 'none' | 'curatorial' | 'vitrine' | 'editorial' | 'sponsored';
    is_sponsored?: boolean;
    age_rating?: string;
    genres?: string[];
    slug?: string;
    ticket_url?: string;
    status?: string;
    lineup?: Array<{ name: string; is_headliner?: boolean }>;
  };
  variant?: 'default' | 'compact' | 'grid' | 'featured';
  className?: string;
  onClick?: () => void;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onView?: (eventId: string) => void;
  isDeleting?: boolean;
}

const highlightConfig = {
  none: {
    gradient: '',
    badge: null,
    icon: null,
    glow: '',
    border: 'border-border',
  },
  curatorial: {
    gradient: 'bg-gradient-to-br from-primary/10 via-background to-primary/5',
    badge: { text: 'Destaque Curatorial', variant: 'secondary' as const },
    icon: Star,
    glow: 'shadow-lg shadow-primary/20',
    border: 'border-primary/30',
  },
  vitrine: {
    gradient: 'bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10',
    badge: { text: 'Vitrine Cultural', variant: 'default' as const },
    icon: Crown,
    glow: 'shadow-xl shadow-yellow-500/30',
    border: 'border-yellow-500/40',
  }
};

export function AdminEventCardV3({ 
  event, 
  variant = 'compact', 
  className,
  onClick,
  onEdit,
  onDelete,
  onView,
  isDeleting = false
}: AdminEventCardV3Props) {
  // Normalize highlight_type for backward compatibility
  const normalizedHighlightType = (() => {
    const type = event.highlight_type || 'none';
    if (type === 'editorial') return 'curatorial';
    if (type === 'sponsored') return 'vitrine';
    return type;
  })();
  
  const config = highlightConfig[normalizedHighlightType] || highlightConfig.none;
  const IconComponent = config?.icon;
  
  const formatEventDate = (dateStart?: string, dateEnd?: string) => {
    if (!dateStart) return '';
    
    const start = new Date(dateStart);
    const end = dateEnd ? new Date(dateEnd) : null;
    
    if (end && start.toDateString() !== end.toDateString()) {
      return `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM', { locale: ptBR })}`;
    }
    
    return format(start, 'dd MMM • HH:mm', { locale: ptBR });
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      draft: { text: 'Rascunho', variant: 'outline' as const },
      scheduled: { text: 'Agendado', variant: 'secondary' as const },
      published: { text: 'Publicado', variant: 'default' as const },
      archived: { text: 'Arquivado', variant: 'destructive' as const }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn("group cursor-pointer", className)}
      onClick={onClick}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        config.border,
        config.glow,
        config.gradient,
        isDeleting && "opacity-50"
      )}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {event.image_url ? (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              
              {/* Highlight Badge */}
              {config.badge && (
                <div className="absolute -top-1 -right-1">
                  <Badge 
                    variant={config.badge.variant}
                    className="text-xs px-1 py-0 h-5"
                  >
                    {IconComponent && <IconComponent className="h-3 w-3" />}
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                
                {/* Admin Actions */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        disabled={isDeleting}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(event.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(event.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <ConfirmDialog
                            title="Confirmar exclusão"
                            description={`Tem certeza que deseja excluir o evento "${event.title}"? Esta ação não pode ser desfeita.`}
                            onConfirm={() => onDelete(event.id)}
                            confirmText="Excluir"
                            cancelText="Cancelar"
                            variant="destructive"
                          >
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </ConfirmDialog>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mb-2">
                <Badge {...getStatusBadge(event.status)} className="text-xs">
                  {getStatusBadge(event.status).text}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{formatEventDate(event.date_start, event.date_end)}</span>
              </div>
              
              {event.location_name && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{event.location_name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}