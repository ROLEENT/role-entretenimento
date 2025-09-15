import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Settings } from 'lucide-react';
import { useV5Preferences } from '@/hooks/useV5Preferences';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function V5QuickToggle() {
  const { preference, setV5Preference } = useV5Preferences();

  const getPreferenceLabel = () => {
    switch (preference) {
      case 'always-v5':
        return 'V5';
      case 'always-v4':
        return 'V4';
      case 'ask-each-time':
        return 'Perguntar';
      default:
        return 'Não definida';
    }
  };

  const getPreferenceVariant = () => {
    return preference === 'always-v5' ? 'default' : 'secondary';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <Badge variant={getPreferenceVariant()} className="h-5">
            {getPreferenceLabel()}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Versão Preferida</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => setV5Preference('always-v5')}
          className={preference === 'always-v5' ? 'bg-primary/10' : ''}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          <span>Sempre V5</span>
          {preference === 'always-v5' && (
            <Badge className="ml-auto h-5">Ativo</Badge>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setV5Preference('always-v4')}
          className={preference === 'always-v4' ? 'bg-primary/10' : ''}
        >
          <Settings className="h-4 w-4 mr-2" />
          <span>Sempre V4</span>
          {preference === 'always-v4' && (
            <Badge variant="secondary" className="ml-auto h-5">Ativo</Badge>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setV5Preference('ask-each-time')}
          className={preference === 'ask-each-time' ? 'bg-primary/10' : ''}
        >
          <span>Perguntar a cada vez</span>
          {preference === 'ask-each-time' && (
            <Badge variant="outline" className="ml-auto h-5">Ativo</Badge>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => setV5Preference(null)}
          className="text-muted-foreground"
        >
          Reset Preferência
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}