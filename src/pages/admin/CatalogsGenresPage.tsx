import { Helmet } from 'react-helmet-async';
import { GenresTable } from '@/components/admin/catalogs/GenresTable';

export default function CatalogsGenresPage() {
  return (
    <>
      <Helmet>
        <title>Gêneros Musicais - Admin</title>
      </Helmet>
      
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Gêneros Musicais</h1>
            <p className="text-muted-foreground">
              Gerencie os gêneros musicais disponíveis para classificação dos artistas.
            </p>
          </div>
          
          <GenresTable />
        </div>
      </div>
    </>
  );
}