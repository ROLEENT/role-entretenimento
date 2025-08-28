import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, Calendar, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';

export const GlobalSearch = () => {
  const { searchTerm, setSearchTerm, results, isLoading, findExactMatch } = useGlobalSearch();
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const exactMatch = findExactMatch(searchTerm);
    if (exactMatch) {
      // Navegar direto para edição se match exato
      if (exactMatch.type === 'highlight') {
        navigate(`/admin-highlight-editor?id=${exactMatch.id}`);
      } else {
        navigate(`/admin-event-edit/${exactMatch.id}`);
      }
      setShowResults(false);
      setSearchTerm('');
    } else {
      setShowResults(true);
    }
  };

  const handleResultClick = (result: any) => {
    if (result.type === 'highlight') {
      navigate(`/admin-highlight-editor?id=${result.id}`);
    } else {
      navigate(`/admin-event-edit/${result.id}`);
    }
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Search className="h-6 w-6" />
          Pesquisa Global
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Busque por título, slug, artista, evento ou organizador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="Buscar por título, slug, artista, evento ou organizador"
            value={searchTerm}
            className="text-base h-12 border-2 focus:border-primary"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.length >= 2) {
                setShowResults(true);
              } else {
                setShowResults(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
              if (e.key === '/') {
                e.preventDefault();
                e.currentTarget.focus();
              }
            }}
          />
          <Button 
            onClick={handleSearch} 
            disabled={!searchTerm.trim()}
            className="h-12 px-6 bg-primary hover:bg-primary-hover"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Dica: Pressione "/" para focar na busca
        </div>

        {showResults && searchTerm.length >= 2 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Buscando...
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center gap-3">
                    {result.type === 'highlight' ? (
                      <Star className="h-4 w-4 text-purple-500" />
                    ) : (
                      <Calendar className="h-4 w-4 text-blue-500" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{result.title}</div>
                      {result.city && (
                        <div className="text-xs text-muted-foreground">{result.city}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status && (
                      <Badge 
                        variant={result.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {result.status}
                      </Badge>
                    )}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};