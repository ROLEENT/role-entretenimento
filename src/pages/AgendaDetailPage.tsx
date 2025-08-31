import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Clock, Share2, ExternalLink, User, Building, Music } from 'lucide-react';
import BackToTop from '@/components/BackToTop';
import SEOHead from '@/components/SEOHead';
import { MobileSafeImage } from '@/components/ui/mobile-safe-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeHTML } from '@/components/ui/safe-html';
import { supabase } from '@/integrations/supabase/client';
import { formatEventDateTime } from '@/utils/dateUtils';
import { useNativeShare } from '@/hooks/useNativeShare';
import { toast } from 'sonner';

interface AgendaItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  cover_url?: string;
  alt_text?: string;
  city?: string;
  start_at?: string;
  end_at?: string;
  ticket_url?: string;
  tags?: string[];
  artists_names?: string[];
  meta_title?: string;
  meta_description?: string;
  noindex?: boolean;
  venue_id?: string;
  organizer_id?: string;
  created_at: string;
  status: string;
  venue?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
  };
  organizer?: {
    id: string;
    name: string;
    site?: string;
    instagram?: string;
  };
}

const AgendaDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<AgendaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousItem, setPreviousItem] = useState<{ slug: string; title: string } | null>(null);
  const [nextItem, setNextItem] = useState<{ slug: string; title: string } | null>(null);
  
  const { shareOrFallback } = useNativeShare();

  useEffect(() => {
    if (slug) {
      fetchAgendaItem(slug);
    }
  }, [slug]);

  const fetchAgendaItem = async (itemSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main item
      const { data, error: fetchError } = await supabase
        .from('agenda_public')
        .select(`
          *,
          venue:venues(id, name, address, city),
          organizer:organizers(id, name, site, instagram)
        `)
        .eq('slug', itemSlug)
        .eq('status', 'published')
        .is('deleted_at', null)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Evento não encontrado');
        } else {
          throw fetchError;
        }
        return;
      }

      setItem(data);

      // Fetch navigation items
      fetchNavigationItems(data.start_at);
    } catch (error) {
      console.error('Error fetching agenda item:', error);
      setError('Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  const fetchNavigationItems = async (currentStartAt: string) => {
    try {
      // Get previous item (earlier date)
      const { data: prevData } = await supabase
        .from('agenda_public')
        .select('slug, title, start_at')
        .eq('status', 'published')
        .is('deleted_at', null)
        .lt('start_at', currentStartAt)
        .order('start_at', { ascending: false })
        .limit(1);

      if (prevData && prevData.length > 0) {
        setPreviousItem({ slug: prevData[0].slug, title: prevData[0].title });
      }

      // Get next item (later date)
      const { data: nextData } = await supabase
        .from('agenda_public')
        .select('slug, title, start_at')
        .eq('status', 'published')
        .is('deleted_at', null)
        .gt('start_at', currentStartAt)
        .order('start_at', { ascending: true })
        .limit(1);

      if (nextData && nextData.length > 0) {
        setNextItem({ slug: nextData[0].slug, title: nextData[0].title });
      }
    } catch (error) {
      console.error('Error fetching navigation items:', error);
    }
  };

  const handleShare = async () => {
    if (!item) return;

    const shareData = {
      title: item.title,
      text: `Confira este evento: ${item.title}${item.city ? ` em ${item.city}` : ''}`,
      url: window.location.href
    };

    shareOrFallback(shareData, () => {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    });
  };

  const generateSignedUrl = async (url: string) => {
    // If it's a Supabase storage URL and storage is private, generate signed URL
    if (url.includes('supabase') && url.includes('/storage/')) {
      try {
        const path = url.split('/storage/v1/object/public/')[1];
        if (path) {
          const [bucket, ...filePath] = path.split('/');
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath.join('/'), 3600); // 1 hour TTL

          if (!error && data) {
            return data.signedUrl;
          }
        }
      } catch (error) {
        console.error('Error generating signed URL:', error);
      }
    }
    return url;
  };

  const renderJsonLd = () => {
    if (!item) return null;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: item.title,
      description: item.summary || item.title,
      startDate: item.start_at,
      endDate: item.end_at,
      location: item.venue ? {
        "@type": "Place",
        name: item.venue.name,
        address: item.venue.address || item.city
      } : item.city,
      image: item.cover_url,
      organizer: item.organizer ? {
        "@type": "Organization",
        name: item.organizer.name,
        url: item.organizer.site
      } : undefined,
      offers: item.ticket_url ? {
        "@type": "Offer",
        url: item.ticket_url,
        availability: "https://schema.org/InStock"
      } : undefined
    };

    return (
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  };

  if (loading) {
    return (
      <div className="pt-20">
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="aspect-[16/9] bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="pt-20">
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'O evento que você está procurando não existe ou foi removido.'}
          </p>
          <Button asChild>
            <Link to="/agenda" className="inline-flex items-center justify-center">Ver Agenda</Link>
          </Button>
        </main>
      </div>
    );
  }

  const pageTitle = item.meta_title || `${item.title} | ROLÊ`;
  const pageDescription = item.meta_description || 
    `${item.title}${item.city ? ` em ${item.city}` : ''}${item.start_at ? ` - ${formatEventDateTime(item.start_at)}` : ''}`;

  return (
    <div className="pt-20">
      <SEOHead 
        title={pageTitle}
        description={pageDescription}
        noindex={item.noindex}
        image={item.cover_url}
        type="article"
      />
      {renderJsonLd()}
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <section className="space-y-6">
            {/* Cover Image */}
            {item.cover_url && (
              <div className="aspect-[16/9] md:aspect-[21/9] relative overflow-hidden rounded-lg">
                <MobileSafeImage
                  src={item.cover_url}
                  alt={item.alt_text || item.title}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
                {item.alt_text && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Crédito: {item.alt_text}
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {item.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              {item.venue && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{item.venue.name}</span>
                </div>
              )}
              
              {item.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{item.city}</span>
                </div>
              )}
              
              {item.start_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={item.start_at}>
                    {formatEventDateTime(item.start_at, item.end_at)}
                  </time>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {item.ticket_url && (
                <Button asChild size="lg">
                  <a 
                    href={item.ticket_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Comprar Ingresso
                  </a>
                </Button>
              )}
              
              <Button variant="outline" size="lg" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </section>

          {/* Content */}
          {item.summary && (
            <section className="prose prose-lg max-w-none dark:prose-invert">
              <SafeHTML 
                content={item.summary}
                className="text-base leading-relaxed"
              />
            </section>
          )}

          {/* Line-up */}
          {item.artists_names && item.artists_names.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Music className="h-5 w-5" />
                Line-up
              </h2>
              <div className="flex flex-wrap gap-2">
                {item.artists_names.map((artist, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {artist}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}


          {/* Organizer & Venue Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organizer */}
            {item.organizer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Organizador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold">{item.organizer.name}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {item.organizer.site && (
                      <Button asChild variant="outline" size="sm">
                        <a 
                          href={item.organizer.site} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Website
                        </a>
                      </Button>
                    )}
                    
                    {item.organizer.instagram && (
                      <Button asChild variant="outline" size="sm">
                        <a 
                          href={`https://instagram.com/${item.organizer.instagram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Instagram
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Venue */}
            {item.venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Local
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold">{item.venue.name}</h3>
                    {item.venue.address && (
                      <p className="text-sm text-muted-foreground">{item.venue.address}</p>
                    )}
                    {item.venue.city && (
                      <p className="text-sm text-muted-foreground">{item.venue.city}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex justify-between items-center pt-8 border-t">
            <div className="flex-1">
              {previousItem && (
                <Button 
                  asChild 
                  variant="ghost" 
                  className="h-auto p-3 justify-start text-left"
                >
                  <Link to={`/agenda/${previousItem.slug}`} className="group inline-flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <div>
                      <div className="text-xs text-muted-foreground">Anterior</div>
                      <div className="text-sm font-medium line-clamp-1">
                        {previousItem.title}
                      </div>
                    </div>
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex-1 text-right">
              {nextItem && (
                <Button 
                  asChild 
                  variant="ghost" 
                  className="h-auto p-3 justify-end text-right"
                >
                  <Link to={`/agenda/${nextItem.slug}`} className="group inline-flex items-center gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Próximo</div>
                      <div className="text-sm font-medium line-clamp-1">
                        {nextItem.title}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </main>
      <BackToTop />
    </div>
  );
};

export default AgendaDetailPage;