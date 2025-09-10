import { Helmet } from 'react-helmet-async';
import { ProfileSearch } from '@/components/search/ProfileSearch';

export default function SearchPage() {
  return (
    <>
      <Helmet>
        <title>Buscar Perfis - Plataforma Cultural</title>
        <meta name="description" content="Encontre artistas, locais e organizadores de eventos culturais. Descubra talentos e espaços incríveis para sua próxima experiência cultural." />
        <meta name="keywords" content="busca, artistas, locais, organizadores, eventos culturais, música, entretenimento" />
        <link rel="canonical" href={`${window.location.origin}/buscar`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Descubra Perfis</h1>
            <p className="text-lg text-muted-foreground">
              Encontre artistas, locais e organizadores de eventos culturais
            </p>
          </div>

          <ProfileSearch />
        </div>
      </div>
    </>
  );
}