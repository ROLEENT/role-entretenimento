import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/components/PublicLayout';
import { SEOHelmet } from '@/components/SEOHelmet';
import { Hero } from '@/components/revista/Hero';
import { SubnavChips } from '@/components/revista/SubnavChips';
import { FiltersBar } from '@/components/revista/FiltersBar';
import { ArticleCard } from '@/components/revista/ArticleCard';
import { Sidebar } from '@/components/revista/Sidebar';
import { useRevistaData, RevistaPost } from '@/hooks/useRevistaData';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useDebounce } from 'use-debounce';

// Interface para filtros sem cidade + ordenação
type Filters = {
  q: string;
  secao: string;
  sort: string;
};

// Utilitários para URL sem cidade + ordenação
function readFromURL(sp: URLSearchParams): Filters {
  return {
    q: sp.get('q') || '',
    secao: sp.get('secao') || '',
    sort: sp.get('sort') || 'recent',
  };
}

function normalize(f: Filters): Record<string, string> {
  const clean: Record<string, string> = {};
  if (f.q) clean.q = f.q;
  if (f.secao) clean.secao = f.secao;
  if (f.sort && f.sort !== 'recent') clean.sort = f.sort;
  return clean;
}

function toQS(f: Filters): string {
  const obj = normalize(f);
  return new URLSearchParams(obj).toString();
}

function shallowEqual(a: Filters, b: Filters): boolean {
  return a.q === b.q && a.secao === b.secao && a.sort === b.sort;
}

export default function RevistaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estados
  const [filters, setFilters] = useState<Filters>(() => readFromURL(searchParams));
  const [posts, setPosts] = useState<RevistaPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Debounce da busca
  const [debouncedSearch] = useDebounce(filters.q, 250);
  
  // Ref para controle de aborts
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Chave para cache
  const filterKey = useMemo(
    () => `${debouncedSearch}|${filters.secao}|${filters.sort}`,
    [debouncedSearch, filters.secao, filters.sort]
  );

  // Hook para buscar dados
  const { 
    posts: hookPosts, 
    totalCount: hookTotalCount,
    isLoading: hookIsLoading,
    error: hookError,
    refetch 
  } = useRevistaData({
    searchTerm: debouncedSearch,
    sectionFilter: filters.secao,
    sortBy: filters.sort,
    limit: 12,
  });

  // Sincronizar dados do hook
  useEffect(() => {
    setPosts(hookPosts);
    setTotalCount(hookTotalCount);
    setIsLoading(hookIsLoading);
    setError(hookError);
  }, [hookPosts, hookTotalCount, hookIsLoading, hookError]);

  // Sincronização com URL
  useEffect(() => {
    const currentQS = toQS(filters);
    const urlQS = searchParams.toString();
    
    if (currentQS !== urlQS) {
      navigate(currentQS ? `?${currentQS}` : '?', { replace: true });
    }
  }, [filters, navigate, searchParams]);

  // Handlers
  const handleSearchChange = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, q: searchTerm }));
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    setFilters(prev => ({ ...prev, secao: section }));
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setFilters(prev => ({ ...prev, sort }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ q: '', secao: '', sort: 'recent' });
  }, []);

  const handleLoadMore = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'load_more', {
        source: 'revista_pagination'
      });
    }
    // Implementar paginação se necessário
  }, []);

  // Posts para hero (3 primeiros)
  const heroPosts = posts.slice(0, 3);
  const gridPosts = posts.slice(3);

  return (
    <PublicLayout>
      <SEOHelmet
        title={`Revista ROLÊ${filters.secao ? ` - ${filters.secao}` : ''}${filters.q ? ` - ${filters.q}` : ''}`}
        description="Mergulhos profundos em cultura, música e noite no Brasil. Artigos, entrevistas e análises sobre a cena cultural brasileira."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Revista ROLÊ",
          "description": "Artigos sobre cultura, música e noite",
          "numberOfItems": totalCount,
          "itemListElement": posts.slice(0, 10).map((post, index) => ({
            "@type": "Article",
            "position": index + 1,
            "name": post.title,
            "description": post.excerpt,
            "url": `https://role.com.br/revista/${post.slug}`,
            "datePublished": post.published_at,
            "author": {
              "@type": "Person",
              "name": post.author_name || "ROLÊ"
            }
          }))
        }}
      />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Conteúdo principal */}
            <div className="lg:col-span-3 space-y-8">
              {/* Header */}
              <header className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight">Revista ROLÊ</h1>
                  <p className="text-xl text-muted-foreground">
                    Mergulhos profundos em cultura, música e noite no Brasil
                  </p>
                </div>
                
                {/* Navegação por chips */}
                <SubnavChips 
                  currentSection={filters.secao}
                  onSectionChange={handleSectionChange}
                />
              </header>

              {/* Filtros */}
              <FiltersBar
                searchTerm={filters.q}
                sectionFilter={filters.secao}
                sortBy={filters.sort}
                onSearchChange={handleSearchChange}
                onSectionChange={handleSectionChange}
                onSortChange={handleSortChange}
                onClearFilters={handleClearFilters}
                totalCount={totalCount}
                className="sticky top-4 z-10"
              />

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              )}

              {/* Error */}
              {error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                    <button 
                      onClick={refetch}
                      className="ml-2 underline hover:no-underline"
                    >
                      Tentar novamente
                    </button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Hero Section */}
              {!isLoading && !error && heroPosts.length >= 3 && (
                <Hero
                  mainPost={heroPosts[0]}
                  sideePosts={heroPosts.slice(1, 3)}
                />
              )}

              {/* Grid de artigos */}
              {!isLoading && !error && gridPosts.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold">
                    {filters.q || filters.secao ? 'Resultados' : 'Mais artigos'}
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {gridPosts.map((post) => (
                      <ArticleCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}

              {/* Paginação */}
              {!isLoading && !error && posts.length > 0 && hasMore && (
                <div className="flex justify-center py-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Carregar mais artigos
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !error && posts.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <h3 className="text-xl font-semibold">Nenhum artigo encontrado</h3>
                  <p className="text-muted-foreground">
                    {filters.q || filters.secao 
                      ? 'Tente ajustar os filtros ou fazer uma nova busca'
                      : 'Ainda não temos artigos publicados'
                    }
                  </p>
                  {(filters.q || filters.secao) && (
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}