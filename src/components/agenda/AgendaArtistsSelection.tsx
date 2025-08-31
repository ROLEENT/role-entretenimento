import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { AgentesTagsInput } from '@/components/agentes/AgentesTagsInput';
import { ArtistMultiSelect } from '@/components/ArtistMultiSelect';

export function AgendaArtistsSelection() {
  const { watch } = useFormContext();

  const artistIds = watch('artist_ids') || [];
  const artistsNames = watch('artists_names') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Artistas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Multi-select de artistas cadastrados */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Artistas Cadastrados
          </label>
          <ArtistMultiSelect
            value={artistIds}
            onValueChange={(value) => {
              // setValue será manejado pelo componente internamente
            }}
          />
          <p className="text-xs text-muted-foreground">
            Selecione artistas já cadastrados no sistema
          </p>
        </div>

        {/* Chips para artistas extras */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Artistas Extras
          </label>
          <AgentesTagsInput 
            name="artists_names"
            placeholder="Digite nomes de artistas não cadastrados..."
          />
          <p className="text-xs text-muted-foreground">
            Para artistas ainda não cadastrados no sistema
          </p>
        </div>

        {/* Resumo */}
        {(artistIds.length > 0 || artistsNames.length > 0) && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Resumo dos Artistas:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              {artistIds.length > 0 && (
                <p>• {artistIds.length} artista(s) cadastrado(s)</p>
              )}
              {artistsNames.length > 0 && (
                <p>• {artistsNames.length} artista(s) extra(s)</p>
              )}
              <p className="text-xs">
                Total: {artistIds.length + artistsNames.length}/24 artistas
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}