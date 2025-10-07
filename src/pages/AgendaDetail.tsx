import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Ticket, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";

export default function AgendaDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event-detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full rounded-lg mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
          <Button asChild>
            <Link to="/agenda">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para agenda
            </Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{event.title} - Rolezeira</title>
        <meta name="description" content={event.subtitle || event.summary || ''} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Image */}
          {event.image_url && (
            <div className="w-full h-96 relative">
              <img
                src={event.image_url}
                alt={event.cover_alt || event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/agenda">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>

            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            {event.subtitle && (
              <p className="text-xl text-muted-foreground mb-6">{event.subtitle}</p>
            )}

            {/* Event Info */}
            <div className="flex flex-wrap gap-4 mb-8">
              {event.date_start && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span>{formatDate(event.date_start)}</span>
                </div>
              )}
              {event.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{event.city}</span>
                </div>
              )}
              {event.location_name && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{event.location_name}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="prose prose-lg max-w-none mb-8">
                <p>{event.description}</p>
              </div>
            )}

            {/* CTA */}
            {event.ticket_url && (
              <Button size="lg" asChild>
                <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                  <Ticket className="w-5 h-5 mr-2" />
                  Comprar Ingressos
                </a>
              </Button>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
