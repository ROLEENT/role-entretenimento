import React from 'react';
import ArtistForm from './Form';

export default function AdminArtistCreate() {
  console.log('[ADMIN ARTIST CREATE] Renderizando componente');
  
  try {
    return <ArtistForm mode="create" />;
  } catch (error) {
    console.error('[ADMIN ARTIST CREATE] Erro:', error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Erro ao carregar formulário</h1>
        <p className="text-muted-foreground mt-2">
          Ocorreu um erro ao carregar o formulário de criação de artistas. 
          Verifique o console para mais detalhes.
        </p>
        <pre className="mt-4 p-4 bg-muted rounded text-sm">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </pre>
      </div>
    );
  }
}