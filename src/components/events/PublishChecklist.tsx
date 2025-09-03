import { CheckCircle, Circle, AlertCircle, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EventFormData } from "@/schemas/eventSchema";

interface PublishChecklistProps {
  eventData: Partial<EventFormData>;
  className?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  category: 'required' | 'recommended' | 'seo' | 'advanced';
  check: (data: Partial<EventFormData>) => boolean;
  priority: 'high' | 'medium' | 'low';
}

const checklistItems: ChecklistItem[] = [
  // Required items
  {
    id: 'title',
    label: 'Título do evento',
    description: 'Nome principal que aparecerá nos cards',
    category: 'required',
    priority: 'high',
    check: (data) => Boolean(data.title && data.title.length >= 3)
  },
  {
    id: 'date_start',
    label: 'Data de início',
    description: 'Data e horário quando o evento começa',
    category: 'required',
    priority: 'high',
    check: (data) => Boolean(data.date_start)
  },
  {
    id: 'city',
    label: 'Cidade',
    description: 'Onde o evento acontece',
    category: 'required',
    priority: 'high',
    check: (data) => Boolean(data.city)
  },
  {
    id: 'location_name',
    label: 'Local específico',
    description: 'Nome do venue, casa ou espaço',
    category: 'required',
    priority: 'high',
    check: (data) => Boolean(data.location_name)
  },
  {
    id: 'summary',
    label: 'Resumo do evento',
    description: 'Descrição curta que aparece nos cards',
    category: 'required',
    priority: 'medium',
    check: (data) => Boolean(data.summary && data.summary.length >= 20)
  },

  // Recommended items
  {
    id: 'image_url',
    label: 'Imagem principal',
    description: 'Flyer ou foto para os cards',
    category: 'recommended',
    priority: 'high',
    check: (data) => Boolean(data.image_url)
  },
  {
    id: 'lineup',
    label: 'Lineup definido',
    description: 'Pelo menos um artista ou slot de lineup',
    category: 'recommended',
    priority: 'medium',
    check: (data) => Boolean(data.lineup_slots && data.lineup_slots.length > 0)
  },
  {
    id: 'price_range',
    label: 'Informações de preço',
    description: 'Faixa de preço dos ingressos',
    category: 'recommended',
    priority: 'medium',
    check: (data) => Boolean(data.price_min !== undefined || data.price_max !== undefined)
  },
  {
    id: 'ticket_url',
    label: 'Link de ingressos',
    description: 'Onde comprar ingressos',
    category: 'recommended',
    priority: 'medium',
    check: (data) => Boolean(data.ticket_url || data.ticketing?.url)
  },
  {
    id: 'age_rating',
    label: 'Classificação etária',
    description: 'Idade mínima recomendada',
    category: 'recommended',
    priority: 'low',
    check: (data) => Boolean(data.age_rating && data.age_rating !== 'L')
  },

  // SEO items
  {
    id: 'seo_title',
    label: 'Título SEO',
    description: 'Otimizado para buscadores (50-60 caracteres)',
    category: 'seo',
    priority: 'medium',
    check: (data) => Boolean(data.seo_title && data.seo_title.length >= 30 && data.seo_title.length <= 60)
  },
  {
    id: 'seo_description',
    label: 'Descrição SEO',
    description: 'Meta descrição para buscadores (150-160 caracteres)',
    category: 'seo',
    priority: 'medium',
    check: (data) => Boolean(data.seo_description && data.seo_description.length >= 120 && data.seo_description.length <= 160)
  },
  {
    id: 'slug',
    label: 'URL amigável',
    description: 'Slug único para o evento',
    category: 'seo',
    priority: 'low',
    check: (data) => Boolean(data.slug && data.slug.length >= 3)
  },
  {
    id: 'og_image_url',
    label: 'Imagem para redes sociais',
    description: 'Imagem otimizada para compartilhamento',
    category: 'seo',
    priority: 'low',
    check: (data) => Boolean(data.og_image_url)
  },

  // Advanced items
  {
    id: 'genres',
    label: 'Gêneros musicais',
    description: 'Tags para categorização',
    category: 'advanced',
    priority: 'low',
    check: (data) => Boolean(data.genres && data.genres.length > 0)
  },
  {
    id: 'accessibility',
    label: 'Informações de acessibilidade',
    description: 'Recursos para pessoas com deficiência',
    category: 'advanced',
    priority: 'low',
    check: (data) => Boolean(data.accessibility && Object.keys(data.accessibility).length > 0)
  },
  {
    id: 'social_links',
    label: 'Links das redes sociais',
    description: 'Instagram, Facebook, etc.',
    category: 'advanced',
    priority: 'low',
    check: (data) => Boolean(data.links && Object.keys(data.links).length > 0)
  }
];

const categoryConfig = {
  required: {
    title: 'Obrigatório',
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  recommended: {
    title: 'Recomendado',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10'
  },
  seo: {
    title: 'SEO',
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10'
  },
  advanced: {
    title: 'Avançado',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10'
  }
};

export function PublishChecklist({ eventData, className }: PublishChecklistProps) {
  const getCompletionByCategory = (category: string) => {
    const categoryItems = checklistItems.filter(item => item.category === category);
    const completedItems = categoryItems.filter(item => item.check(eventData));
    return {
      completed: completedItems.length,
      total: categoryItems.length,
      percentage: categoryItems.length > 0 ? (completedItems.length / categoryItems.length) * 100 : 0
    };
  };

  const overallCompletion = () => {
    const requiredItems = checklistItems.filter(item => item.category === 'required');
    const recommendedItems = checklistItems.filter(item => item.category === 'recommended');
    const allCriticalItems = [...requiredItems, ...recommendedItems];
    
    const completedCritical = allCriticalItems.filter(item => item.check(eventData));
    
    return {
      completed: completedCritical.length,
      total: allCriticalItems.length,
      percentage: allCriticalItems.length > 0 ? (completedCritical.length / allCriticalItems.length) * 100 : 0,
      canPublish: requiredItems.every(item => item.check(eventData))
    };
  };

  const overall = overallCompletion();

  const renderCategory = (categoryKey: string) => {
    const category = categoryConfig[categoryKey as keyof typeof categoryConfig];
    const completion = getCompletionByCategory(categoryKey);
    const items = checklistItems.filter(item => item.category === categoryKey);
    const IconComponent = category.icon;

    return (
      <div key={categoryKey} className="space-y-3">
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-md", category.bgColor)}>
              <IconComponent className={cn("h-4 w-4", category.color)} />
            </div>
            <div>
              <h4 className="font-medium">{category.title}</h4>
              <p className="text-sm text-muted-foreground">
                {completion.completed} de {completion.total} itens
              </p>
            </div>
          </div>
          <Badge 
            variant={completion.percentage === 100 ? "default" : "secondary"}
            className="ml-2"
          >
            {Math.round(completion.percentage)}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <Progress value={completion.percentage} className="h-2" />

        {/* Items List */}
        <div className="space-y-2">
          {items.map((item) => {
            const isCompleted = item.check(eventData);
            return (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <Badge 
                  variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Checklist de Publicação
          </CardTitle>
          <Badge 
            variant={overall.canPublish ? "default" : "destructive"}
            className="ml-2"
          >
            {overall.canPublish ? "Pronto para publicar" : "Pendências"}
          </Badge>
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progresso geral</span>
            <span className="font-medium">
              {overall.completed} de {overall.total} itens críticos
            </span>
          </div>
          <Progress value={overall.percentage} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {overall.canPublish 
              ? "Todos os itens obrigatórios foram preenchidos. Você pode publicar o evento."
              : "Complete os itens obrigatórios para poder publicar o evento."
            }
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.keys(categoryConfig).map(renderCategory)}
      </CardContent>
    </Card>
  );
}