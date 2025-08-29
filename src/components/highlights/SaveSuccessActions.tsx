import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Eye, Settings } from 'lucide-react';

interface SaveSuccessActionsProps {
  highlightId: string;
  status: 'draft' | 'published' | 'scheduled';
  onClose?: () => void;
}

export const SaveSuccessActions = ({ highlightId, status, onClose }: SaveSuccessActionsProps) => {
  const adminUrl = `/admin-v2/highlights/${highlightId}/edit`;
  const previewUrl = status === 'published' ? `/destaque/${highlightId}` : `/preview/destaque/${highlightId}`;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Destaque salvo com sucesso!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-green-700">
          <strong>ID:</strong> {highlightId}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(adminUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Ver no admin
            <ExternalLink className="w-3 h-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(previewUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver prévia
            <ExternalLink className="w-3 h-3" />
          </Button>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Fechar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};