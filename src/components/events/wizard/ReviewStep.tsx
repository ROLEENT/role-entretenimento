import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Calendar,
  Users,
  Image as ImageIcon,
  Link,
  Eye,
  Edit,
  Share2,
  Globe,
  Ticket,
  Music,
  Palette
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  isComplete: boolean;
  isRequired: boolean;
  category: 'basic' | 'content' | 'media' | 'marketing';
}

const REQUIRED_FIELDS = [
  'title',
  'city',
  'date_start',
  'image_url'
];

export const ReviewStep: React.FC = () => {
  const { watch, formState: { errors } } = useFormContext<EventFormData>();
  const [activeTab, setActiveTab] = useState('overview');
  
  const formData = watch();

  // Calculate completeness
  const getChecklist = (): ChecklistItem[] => {
    return [
      // Basic Info
      {
        id: 'title',
        label: 'Título definido',
        isComplete: !!formData.title,
        isRequired: true,
        category: 'basic'
      },
      {
        id: 'city',
        label: 'Cidade selecionada',
        isComplete: !!formData.city,
        isRequired: true,
        category: 'basic'
      },
      {
        id: 'date_start',
        label: 'Data de início definida',
        isComplete: !!formData.date_start,
        isRequired: true,
        category: 'basic'
      },
      {
        id: 'description',
        label: 'Descrição completa',
        isComplete: !!formData.description && formData.description.length > 50,
        isRequired: false,
        category: 'content'
      },
      {
        id: 'summary',
        label: 'Resumo informativo',
        isComplete: !!formData.summary && formData.summary.length > 20,
        isRequired: false,
        category: 'content'
      },
      
      // Media
      {
        id: 'image_url',
        label: 'Imagem principal',
        isComplete: !!formData.image_url,
        isRequired: true,
        category: 'media'
      },
      {
        id: 'cover_url',
        label: 'Imagem de capa',
        isComplete: !!formData.cover_url,
        isRequired: false,
        category: 'media'
      },
      {
        id: 'gallery',
        label: 'Galeria de imagens',
        isComplete: !!formData.gallery && formData.gallery.length > 0,
        isRequired: false,
        category: 'media'
      },
      
      // Marketing
      {
        id: 'seo_title',
        label: 'Título SEO otimizado',
        isComplete: !!formData.seo_title,
        isRequired: false,
        category: 'marketing'
      },
      {
        id: 'seo_description',
        label: 'Descrição SEO',
        isComplete: !!formData.seo_description,
        isRequired: false,
        category: 'marketing'
      },
      {
        id: 'og_image_url',
        label: 'Imagem para redes sociais',
        isComplete: !!formData.og_image_url,
        isRequired: false,
        category: 'marketing'
      },
      {
        id: 'links',
        label: 'Links externos',
        isComplete: !!formData.links && Object.keys(formData.links).length > 0,
        isRequired: false,
        category: 'marketing'
      }
    ];
  };

  const checklist = getChecklist();
  const completedItems = checklist.filter(item => item.isComplete);
  const requiredItems = checklist.filter(item => item.isRequired);
  const completedRequired = requiredItems.filter(item => item.isComplete);
  
  const completionPercentage = Math.round((completedItems.length / checklist.length) * 100);
  const isReadyToPublish = completedRequired.length === requiredItems.length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return Calendar;
      case 'content': return Edit;
      case 'media': return ImageIcon;
      case 'marketing': return Share2;
      default: return CheckCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'content': return 'bg-green-50 text-green-700 border-green-200';
      case 'media': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'marketing': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card className={cn(
        "border-2",
        isReadyToPublish ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isReadyToPublish ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              )}
              <div>
                <h3 className="font-semibold">
                  {isReadyToPublish ? 'Evento pronto para publicação!' : 'Evento em desenvolvimento'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {completedRequired.length}/{requiredItems.length} campos obrigatórios preenchidos
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Completo</div>
            </div>
          </div>

          {!isReadyToPublish && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Preencha os campos obrigatórios para publicar o evento: {
                  requiredItems
                    .filter(item => !item.isComplete)
                    .map(item => item.label)
                    .join(', ')
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Título</p>
                  <p className="font-semibold">{formData.title || 'Não definido'}</p>
                </div>
                {formData.subtitle && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subtítulo</p>
                    <p>{formData.subtitle}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data</p>
                  <p>{formatDate(formData.date_start)}</p>
                  {formData.date_end && formData.date_end !== formData.date_start && (
                    <p className="text-sm text-muted-foreground">até {formatDate(formData.date_end)}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Local</p>
                  <p>{formData.location_name || formData.venue_id || 'Não definido'}</p>
                  <p className="text-sm text-muted-foreground">{formData.city || 'Cidade não definida'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.doors_open_utc && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Abertura</p>
                    <p>{formatTime(formData.doors_open_utc)}</p>
                  </div>
                )}
                {formData.headliner_starts_utc && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Show Principal</p>
                    <p>{formatTime(formData.headliner_starts_utc)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classificação</p>
                  <Badge variant="outline">{formData.age_rating || 'Não definida'}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Ingressos & Preços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faixa de Preço</p>
                  {formData.price_min || formData.price_max ? (
                    <p>
                      {formData.price_min ? `R$ ${formData.price_min}` : 'Gratuito'} 
                      {formData.price_max && formData.price_max !== formData.price_min && 
                        ` - R$ ${formData.price_max}`}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Não definido</p>
                  )}
                </div>
                {formData.ticket_url && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Link de Compra</p>
                    <a 
                      href={formData.ticket_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {formData.ticket_url}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Mídia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Imagem principal</span>
                  {formData.image_url ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Imagem de capa</span>
                  {formData.cover_url ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Badge variant="outline" className="text-xs">Opcional</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Galeria</span>
                  <Badge variant="outline" className="text-xs">
                    {formData.gallery?.length || 0} imagens
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          {formData.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{formData.summary}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Checklist */}
        <TabsContent value="checklist" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['basic', 'content', 'media', 'marketing'].map(category => {
              const categoryItems = checklist.filter(item => item.category === category);
              const categoryCompleted = categoryItems.filter(item => item.isComplete).length;
              const IconComponent = getCategoryIcon(category);
              
              return (
                <Card key={category} className={getCategoryColor(category)}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        {category === 'basic' && 'Básico'}
                        {category === 'content' && 'Conteúdo'}
                        {category === 'media' && 'Mídia'}
                        {category === 'marketing' && 'Marketing'}
                      </div>
                      <Badge variant="outline">
                        {categoryCompleted}/{categoryItems.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.isComplete ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2",
                                item.isRequired 
                                  ? "border-orange-500" 
                                  : "border-gray-300"
                              )} />
                            )}
                            <span className={cn(
                              "text-sm",
                              item.isComplete && "line-through text-muted-foreground"
                            )}>
                              {item.label}
                            </span>
                          </div>
                          {item.isRequired && !item.isComplete && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview do Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Hero Section Preview */}
                <div className="relative">
                  {formData.cover_url || formData.image_url ? (
                    <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={formData.cover_url || formData.image_url} 
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <h1 className="text-3xl font-bold mb-2">{formData.title}</h1>
                        {formData.subtitle && (
                          <p className="text-lg text-white/90">{formData.subtitle}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[21/9] bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Adicione uma imagem de capa</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Info Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(formData.date_start)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(formData.doors_open_utc) || 'Horário não definido'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formData.location_name || 'Local não definido'}</p>
                      <p className="text-sm text-muted-foreground">{formData.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Ticket className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {formData.price_min ? `A partir de R$ ${formData.price_min}` : 'Gratuito'}
                      </p>
                      <p className="text-sm text-muted-foreground">Ingressos</p>
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                {formData.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Sobre o Evento</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap line-clamp-6">
                      {formData.description}
                    </p>
                  </div>
                )}

                {/* Selection Reasons Preview */}
                {formData.highlight_type === 'curatorial' && formData.selection_reasons && formData.selection_reasons.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Motivos da Seleção</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.selection_reasons.map((reason, index) => (
                        <Badge key={index} variant="secondary">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Placeholder for other sections */}
                <div className="text-center py-8 text-muted-foreground">
                  <p>Preview completo estará disponível após a publicação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};