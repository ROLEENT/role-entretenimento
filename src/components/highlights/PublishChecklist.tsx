import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface PublishChecklistProps {
  data: any;
}

export const PublishChecklist = ({ data }: PublishChecklistProps) => {
  const checklistItems = [
    { label: 'Título preenchido', completed: !!data.title?.trim(), required: true },
    { label: 'Slug único', completed: !!data.slug?.trim(), required: true },
    { label: 'Cidade selecionada', completed: !!data.city, required: true },
    { label: 'Data de início', completed: !!data.start_at, required: true },
    { label: 'Data de fim', completed: !!data.end_at, required: true },
    { label: 'Imagem de capa', completed: !!data.cover_url, required: true },
    { label: 'Texto alternativo', completed: !data.cover_url || !!data.alt_text?.trim(), required: true }
  ];

  const canPublish = checklistItems.filter(item => item.required).every(item => item.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Checklist de Publicação
          {canPublish ? (
            <Badge className="bg-[#28a745] text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Pronto
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Pendente
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklistItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.completed ? (
              <CheckCircle className="w-4 h-4 text-[#28a745]" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-[#dc3545]" />
            )}
            <span className={`text-sm ${item.completed ? 'text-foreground' : 'text-[#dc3545]'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};