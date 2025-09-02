import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  MapPinIcon, 
  StarIcon, 
  ExternalLinkIcon,
  ImageIcon,
  FileTextIcon,
  ChevronRightIcon
} from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { ProfileAboutSection } from "@/components/profiles/ProfileAboutSection";
import { useProfileEvents } from "@/features/profiles/hooks/useProfileEvents";
import { useProfileReviews } from "@/features/profiles/hooks/useProfileReviews";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileOverviewNewProps {
  profile: Profile;
  onTabChange: (tab: string) => void;
}

export function ProfileOverviewNew({ profile, onTabChange }: ProfileOverviewNewProps) {
  const { data: events = [] } = useProfileEvents(profile.handle, profile.type);
  const { data: reviews = [] } = useProfileReviews(profile.user_id || '');
  
  const upcomingEvents = events.filter(event => 
    event.starts_at && new Date(event.starts_at) > new Date()
  ).slice(0, 3);

  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* About Section */}
      {profile.bio && (
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sobre</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileAboutSection bio={profile.bio} maxLines={3} />
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Próximos Eventos</CardTitle>
          {upcomingEvents.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange('agenda')}
              className="text-primary hover:text-primary-hover"
            >
              Ver todos
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {event.cover_url ? (
                      <img 
                        src={event.cover_url} 
                        alt={event.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <CalendarIcon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                    {event.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{event.subtitle}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {event.starts_at && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {format(new Date(event.starts_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                      {event.location_name && (
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          {event.location_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button size="sm" variant="outline">
                    <ExternalLinkIcon className="w-3 h-3 mr-1" />
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum evento programado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Os próximos eventos aparecerão aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Content */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Último Conteúdo</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onTabChange('conteudos')}
            className="text-primary hover:text-primary-hover"
          >
            Ver todos
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum conteúdo publicado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Matérias e conteúdos aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Avaliações Recentes</CardTitle>
          {recentReviews.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange('avaliacoes')}
              className="text-primary hover:text-primary-hover"
            >
              Ver todas
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recentReviews.length > 0 ? (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {review.reviewer_profile?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {review.reviewer_profile?.name || 'Anônimo'}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.comment}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(review.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <StarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma avaliação ainda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Seja o primeiro a avaliar este perfil
              </p>
              <Button className="mt-4" onClick={() => onTabChange('avaliacoes')}>
                Deixar Avaliação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Gallery Preview */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Galeria</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onTabChange('fotos-videos')}
            className="text-primary hover:text-primary-hover"
          >
            Ver galeria
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma mídia publicada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Fotos e vídeos aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}