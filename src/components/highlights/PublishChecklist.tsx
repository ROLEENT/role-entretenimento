import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { getPublishChecklist, AdvancedHighlightFormData } from '@/lib/advancedHighlightSchema';

interface PublishChecklistProps {
  data: Partial<AdvancedHighlightFormData>;
}

export const PublishChecklist = ({ data }: PublishChecklistProps) => {
  const checklist = getPublishChecklist(data);
  const completedCount = checklist.filter(item => item.completed).length;
  const isReadyToPublish = completedCount === checklist.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Checklist para publicação</h3>
        <Badge variant={isReadyToPublish ? "default" : "secondary"}>
          {completedCount}/{checklist.length}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {checklist.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {item.completed ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
              {item.item}
            </span>
          </div>
        ))}
      </div>
      
      {!isReadyToPublish && (
        <p className="text-xs text-muted-foreground">
          Complete todos os itens para poder publicar o destaque.
        </p>
      )}
    </div>
  );
};