import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface PublishChecklistProps {
  data: any;
  slugError?: string | null;
}

export const PublishChecklist = ({ data, slugError }: PublishChecklistProps) => {
  const checklistItems = [
    { label: 'Título preenchido', completed: !!data.title?.trim(), required: true },
    { label: 'Slug único', completed: !!data.slug?.trim() && !slugError, required: true },
    { label: 'Cidade selecionada', completed: !!data.city, required: true },
    { label: 'Data de início', completed: !!data.start_at, required: true },
    { label: 'Data de fim', completed: !!data.end_at, required: true },
    { label: 'Datas válidas', completed: !data.start_at || !data.end_at || new Date(data.start_at) < new Date(data.end_at), required: true },
    { label: 'Imagem de capa', completed: !!data.cover_url, required: true },
    { label: 'Texto alternativo', completed: !data.cover_url || !!data.alt_text?.trim(), required: true },
    { label: 'Descrição preenchida', completed: !!data.summary?.trim(), required: false },
    { label: 'Meta descrição (SEO)', completed: !!data.meta_description?.trim(), required: false },
  ];

  const requiredItems = checklistItems.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed).length;
  const canPublish = requiredItems.every(item => item.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Checklist de Publicação
          {canPublish ? (
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Pronto para publicar
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {completedRequired}/{requiredItems.length} obrigatórios
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground mb-3">
          <strong>Obrigatórios:</strong> {completedRequired}/{requiredItems.length} concluídos
        </div>
        {checklistItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.completed ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-red-500" />
            )}
            <span className={`text-sm ${item.completed ? 'text-foreground' : 'text-red-600'}`}>
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};