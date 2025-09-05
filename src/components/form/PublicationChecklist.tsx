import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { EventFormData, validateEventForPublish } from '@/schemas/eventSchema';

interface PublicationChecklistProps {
  data: EventFormData;
  slugError?: string | null;
  onPublish?: () => void;
  isPublishing?: boolean;
}

interface ChecklistItem {
  label: string;
  isValid: boolean;
  required: boolean;
}

export const PublicationChecklist = ({ 
  data, 
  slugError, 
  onPublish, 
  isPublishing 
}: PublicationChecklistProps) => {
  const validationErrors = validateEventForPublish(data);
  const hasSlugError = !!slugError;
  
  const checklistItems: ChecklistItem[] = [
    {
      label: 'Título preenchido',
      isValid: !!data.title && data.title.length >= 3,
      required: true,
    },
    {
      label: 'Slug único e válido',
      isValid: !!data.slug && data.slug.length >= 3 && !hasSlugError,
      required: true,
    },
    {
      label: 'Cidade definida',
      isValid: !!data.city && data.city.length >= 2,
      required: true,
    },
    {
      label: 'Local selecionado',
      isValid: !!data.venue_id,
      required: true,
    },
    {
      label: 'Data de início válida',
      isValid: !!data.start_utc,
      required: true,
    },
    {
      label: 'Data de fim válida',
      isValid: !!data.end_utc && new Date(data.end_utc) > new Date(data.start_utc),
      required: true,
    },
    {
      label: 'Capa definida',
      isValid: !!data.cover_url,
      required: true,
    },
    {
      label: 'Texto alternativo da capa',
      isValid: !!data.cover_alt && data.cover_alt.length >= 3,
      required: true,
    },
    {
      label: 'Descrição mínima',
      isValid: !!data.description && data.description.length >= 10,
      required: true,
    },
    {
      label: 'Link de ingresso ou site',
      isValid: !!(data.ticketing?.url || data.links?.site),
      required: true,
    },
    {
      label: 'Artistas definidos',
      isValid: data.artists_names.length > 0,
      required: false,
    },
    {
      label: 'Tags adicionadas',
      isValid: data.tags.length > 0,
      required: false,
    },
    {
      label: 'SEO título definido',
      isValid: !!data.seo_title,
      required: false,
    },
    {
      label: 'SEO descrição definida',
      isValid: !!data.seo_description,
      required: false,
    },
  ];

  const requiredItems = checklistItems.filter(item => item.required);
  const optionalItems = checklistItems.filter(item => !item.required);
  
  const validRequiredItems = requiredItems.filter(item => item.isValid).length;
  const totalRequiredItems = requiredItems.length;
  
  const canPublish = validRequiredItems === totalRequiredItems && validationErrors.length === 0;

  const getStatusIcon = (isValid: boolean, required: boolean) => {
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (required) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Checklist de Publicação</CardTitle>
          {canPublish ? (
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Pronto para publicar
            </Badge>
          ) : (
            <Badge variant="destructive">
              {totalRequiredItems - validRequiredItems} pendências
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Itens obrigatórios */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-foreground">Obrigatórios</h4>
          <div className="space-y-2">
            {requiredItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {getStatusIcon(item.isValid, item.required)}
                <span className={`text-sm ${item.isValid ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Itens opcionais */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-foreground">Recomendados</h4>
          <div className="space-y-2">
            {optionalItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {getStatusIcon(item.isValid, item.required)}
                <span className={`text-sm ${item.isValid ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Erros de validação */}
        {validationErrors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-destructive">Erros a corrigir:</h4>
            <ul className="text-xs text-destructive space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Botão de publicação */}
        {onPublish && (
          <div className="pt-4 border-t">
            <button
              onClick={onPublish}
              disabled={!canPublish || isPublishing}
              className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                canPublish && !isPublishing
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isPublishing ? 'Publicando...' : 'Publicar Evento'}
            </button>
          </div>
        )}

        {/* Progresso */}
        <div className="text-xs text-muted-foreground">
          <p>
            Obrigatórios: {validRequiredItems}/{totalRequiredItems} •{' '}
            Recomendados: {optionalItems.filter(item => item.isValid).length}/{optionalItems.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};