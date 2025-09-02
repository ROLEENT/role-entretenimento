import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ProfileContentSkeleton } from "@/components/skeletons/ProfileContentSkeleton";
import { 
  CalendarIcon, 
  MapPinIcon, 
  StarIcon, 
  ExternalLinkIcon,
  ImageIcon,
  FileTextIcon,
  ChevronRightIcon,
  PlayIcon
} from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { ProfileAboutSection } from "@/components/profiles/ProfileAboutSection";
import { ProfileSimilarArtists } from "./ProfileSimilarArtists";
import { useProfileEvents } from "@/features/profiles/hooks/useProfileEvents";
import { useProfileReviews } from "@/features/profiles/hooks/useProfileReviews";
import { useProfileContent } from "@/features/profiles/hooks/useProfileContent";
import { useProfileMedia } from "@/features/profiles/hooks/useProfileMedia";
import { MediaModal } from "@/components/profiles/MediaModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileOverviewNewProps {
  profile: Profile;
  onTabChange: (tab: string) => void;
}

export function ProfileOverviewNew({ profile, onTabChange }: ProfileOverviewNewProps) {
  const { data: events = [] } = useProfileEvents(profile.handle, profile.type);
  const { data: reviews = [] } = useProfileReviews(profile.user_id || '');
  const { data: contentItems = [], isLoading: isLoadingContent } = useProfileContent(profile.handle, profile.type);
  const { data: mediaItems = [], isLoading: isLoadingMedia } = useProfileMedia(profile.user_id || '');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  
  const upcomingEvents = events.filter(event => 
    event.starts_at && new Date(event.starts_at) > new Date()
  ).slice(0, 3);

  const recentReviews = reviews.slice(0, 3);
  const displayContent = contentItems.slice(0, 3);
  const displayMedia = mediaItems.slice(0, 6);

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
          {isLoadingContent ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg animate-pulse">
                  <div className="w-16 h-16 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayContent.length > 0 ? (
            <div className="space-y-4">
              {displayContent.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item.cover_image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={item.cover_image} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight mb-1 truncate hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    {item.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs hover:bg-primary hover:text-white transition-colors">
                        {item.type === 'article' ? 'Artigo' : 'Post'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum conteúdo publicado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Matérias e conteúdos aparecerão aqui
              </p>
            </div>
          )}
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
          {isLoadingMedia ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : displayMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {displayMedia.map((media, index) => (
                <div 
                  key={media.id}
                  className="group relative cursor-pointer overflow-hidden rounded-lg bg-muted hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedMediaIndex(index)}
                >
                  <AspectRatio ratio={1}>
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.alt_text || 'Mídia do perfil'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                            <PlayIcon className="w-4 h-4 text-black ml-0.5" />
                          </div>
                        </div>
                      </div>
                    )}
                  </AspectRatio>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma mídia publicada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Fotos e vídeos aparecerão aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Similar Artists */}
      <ProfileSimilarArtists profile={profile} />

      {/* Media Modal */}
      {selectedMediaIndex !== null && (
        <MediaModal
          media={mediaItems}
          initialIndex={selectedMediaIndex}
          isOpen={selectedMediaIndex !== null}
          onClose={() => setSelectedMediaIndex(null)}
        />
      )}
    </div>
  );
}