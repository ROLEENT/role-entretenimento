import { Helmet } from 'react-helmet-async';
import { ArtistRolesTable } from '@/components/admin/catalogs/ArtistRolesTable';

export default function CatalogsArtistRolesPage() {
  return (
    <>
      <Helmet>
        <title>Funções de Artista - Admin</title>
      </Helmet>
      
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Funções de Artista</h1>
            <p className="text-muted-foreground">
              Gerencie as funções disponíveis para classificação dos artistas (DJ, Produtor, Designer, etc.).
            </p>
          </div>
          
          <ArtistRolesTable />
        </div>
      </div>
    </>
  );
}