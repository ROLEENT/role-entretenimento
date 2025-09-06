import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ImageRecoveryButton = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRecovery = async () => {
    setIsRecovering(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('recover-artist-images');
      
      if (error) throw error;

      setResult(data);
      
      if (data.success) {
        toast.success(`Recuperação concluída! ${data.matchesFound} imagens recuperadas.`);
      } else {
        toast.error(`Erro na recuperação: ${data.error}`);
      }
    } catch (error) {
      console.error('Recovery error:', error);
      toast.error('Erro ao executar recuperação de imagens');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleRecovery} 
        disabled={isRecovering}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRecovering ? 'animate-spin' : ''}`} />
        {isRecovering ? 'Recuperando...' : 'Recuperar Imagens dos Artistas'}
      </Button>

      {result && (
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {result.success ? 'Recuperação Concluída' : 'Erro na Recuperação'}
            </span>
          </div>
          
          {result.success && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Arquivos no storage: {result.totalFiles}</p>
              <p>Artistas encontrados: {result.totalArtists}</p>
              <p>Imagens recuperadas: {result.matchesFound}</p>
              
              {result.results?.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Artistas atualizados:</p>
                  <ul className="list-disc list-inside">
                    {result.results.map((r: any, i: number) => (
                      <li key={i} className={r.success ? 'text-green-600' : 'text-red-600'}>
                        {r.artist_name} → {r.matched_file}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};