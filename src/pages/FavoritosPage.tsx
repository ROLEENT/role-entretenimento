import React from 'react';
import FavoritesPanel from '@/components/FavoritesPanel';

const FavoritosPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">⭐ Meus Favoritos</h1>
          <p className="text-muted-foreground mt-2">
            Artistas, festas e locais que você salvou ficam aqui. Uma lista pessoal pra acompanhar de perto tudo que você mais curte.
          </p>
        </div>
        <FavoritesPanel />
      </div>
    </div>
  );
};

export default FavoritosPage;