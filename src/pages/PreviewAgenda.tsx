import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePreviewToken } from '@/hooks/usePreviewToken';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, Tag, ExternalLink } from 'lucide-react';

export default function PreviewAgenda() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { validatePreviewToken } = usePreviewToken();
  
  const [agenda, setAgenda] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const checkTokenAndLoadAgenda = async () => {
      if (!slug || !token) {
        setLoading(false);
        return;
      }

      // Validate token
      const valid = await validatePreviewToken(slug, token);
      if (!valid) {
        setIsValidToken(false);
        setLoading(false);
        return;
      }

      setIsValidToken(true);

      // Load agenda data
      try {
        const { data, error } = await supabase
          .from('agenda_itens')
          .select('*')
          .eq('slug', slug)
          .eq('preview_token', token)
          .single();

        if (error) throw error;
        setAgenda(data);
      } catch (error) {
        console.error('Erro ao carregar agenda:', error);
      } finally {
        setLoading(false);
      }
    };

    checkTokenAndLoadAgenda();
  }, [slug, token, validatePreviewToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isValidToken || !agenda) {
    return <Navigate to="/404" replace />;
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner */}
      <div className="bg-blue-600 text-white p-4 text-center">
        <p className="font-medium">
          🔍 Modo de Prévia • Este conteúdo não está publicado
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cover Image */}
        {agenda.cover_url && (
          <div className="relative mb-8 rounded-lg overflow-hidden">
            <img
              src={agenda.cover_url}
              alt={agenda.alt_text || agenda.title}
              className="w-full h-96 object-cover"
              style={{
                objectPosition: agenda.focal_point_x && agenda.focal_point_y
                  ? `${agenda.focal_point_x * 100}% ${agenda.focal_point_y * 100}%`
                  : 'center'
              }}
            />
            {agenda.status === 'draft' && (
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Rascunho
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* Header */}
          <div>
            {agenda.subtitle && (
              <p className="text-lg text-muted-foreground mb-2">
                {agenda.subtitle}
              </p>
            )}
            <h1 className="text-4xl font-bold mb-4">{agenda.title}</h1>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {agenda.type && (
                <Badge variant="outline">
                  <Tag className="w-3 h-3 mr-1" />
                  {agenda.type}
                </Badge>
              )}
              {agenda.city && (
                <Badge variant="outline">
                  <MapPin className="w-3 h-3 mr-1" />
                  {agenda.city}
                </Badge>
              )}
              {agenda.ticket_status && (
                <Badge variant={agenda.ticket_status === 'free' ? 'secondary' : 'default'}>
                  {agenda.ticket_status === 'free' ? 'Gratuito' : 
                   agenda.ticket_status === 'paid' ? 'Pago' :
                   agenda.ticket_status === 'sold_out' ? 'Esgotado' : 
                   'Convite'}
                </Badge>
              )}
            </div>
          </div>

          {/* Date and Time */}
          {(agenda.start_at || agenda.end_at) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agenda.start_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Início: {formatDate(agenda.start_at)}</span>
                  </div>
                )}
                {agenda.end_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Fim: {formatDate(agenda.end_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Location */}
          {(agenda.location_name || agenda.address) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Local
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agenda.location_name && (
                  <p className="font-medium">{agenda.location_name}</p>
                )}
                {agenda.address && (
                  <p className="text-muted-foreground">{agenda.address}</p>
                )}
                {agenda.neighborhood && (
                  <p className="text-sm text-muted-foreground">
                    Bairro: {agenda.neighborhood}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {agenda.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{agenda.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Price and Tickets */}
          {(agenda.price_min || agenda.price_max || agenda.ticket_url) && (
            <Card>
              <CardHeader>
                <CardTitle>Ingressos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(agenda.price_min || agenda.price_max) && (
                  <div>
                    <p className="font-medium">Preços:</p>
                    <p className="text-lg">
                      {agenda.price_min && agenda.price_max 
                        ? `R$ ${agenda.price_min} - R$ ${agenda.price_max}`
                        : agenda.price_min 
                        ? `A partir de R$ ${agenda.price_min}`
                        : `Até R$ ${agenda.price_max}`
                      }
                    </p>
                  </div>
                )}
                
                {agenda.ticket_url && (
                  <a
                    href={agenda.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Comprar Ingressos
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {agenda.tags && agenda.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agenda.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}