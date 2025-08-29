import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Copy } from 'lucide-react';
import { highlightService } from '@/services/highlightService';
import { toast } from 'sonner';

interface HighlightSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (highlightId: string) => void;
}

export const HighlightSearchDialog = ({ open, onOpenChange, onSelect }: HighlightSearchDialogProps) => {
  const [search, setSearch] = useState('');
  const [highlights, setHighlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (search.length >= 2) {
      searchHighlights();
    } else {
      setHighlights([]);
    }
  }, [search]);

  const searchHighlights = async () => {
    try {
      setIsLoading(true);
      const results = await highlightService.getHighlightForDuplication(search);
      setHighlights(results);
    } catch (error) {
      toast.error('Erro ao buscar destaques');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (highlightId: string) => {
    onSelect(highlightId);
    onOpenChange(false);
    setSearch('');
    setHighlights([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicar de outro destaque</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Digite o título do destaque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {search.length < 2 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Digite ao menos 2 caracteres para buscar
            </p>
          )}

          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Buscando...
            </p>
          )}

          {highlights.length === 0 && search.length >= 2 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum destaque encontrado
            </p>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleSelect(highlight.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{highlight.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {highlight.city}
                    </Badge>
                    <Badge 
                      variant={highlight.status === 'published' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {highlight.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};