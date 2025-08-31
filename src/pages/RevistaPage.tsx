import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SEOHelmet } from "@/components/SEOHelmet";
import { PublicLayout } from "@/components/PublicLayout";
import { RevistaCard } from "@/components/revista/RevistaCard";
import { RevistaCardSkeleton } from "@/components/revista/RevistaCardSkeleton";
import { RevistaFilters } from "@/components/revista/RevistaFilters";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useRevistaCache } from "@/hooks/useRevistaCache";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, AlertCircle, Calendar, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface RevistaPost {
  id: string;
  title: string;
  excerpt: string;
  summary: string;
  cover_url: string;
  cover_image: string;
  publish_at: string;
  published_at: string;
  reading_time_min: number;
  reading_time: number;
  city: string;
  slug: string;
  slug_data?: string;
  author_name?: string;
  featured?: boolean;
}

type Filters = { q: string; secao: string; sort: string };

function readFromURL(sp: URLSearchParams): Filters {
  return {
    q: sp.get("q") ?? "",
    secao: sp.get("secao") ?? "",
    sort: sp.get("sort") ?? "recent",
  };
}

function normalize(f: Filters) {
  const out: Record<string, string> = {};
  if (f.q) out.q = f.q;
  if (f.secao) out.secao = f.secao;
  if (f.sort && f.sort !== 'recent') out.sort = f.sort;
  return out;
}

function toQS(f: Filters) {
  const entries = Object.entries(normalize(f)).sort(([a], [b]) => a.localeCompare(b));
  return new URLSearchParams(entries).toString();
}

function shallowEqual(a: Filters, b: Filters) {
  return a.q === b.q && a.secao === b.secao && a.sort === b.sort;
}

export default function RevistaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estado com filtros únicos
  const [filters, setFilters] = useState<Filters>(() => readFromURL(searchParams));
  const didHydrate = useRef(false);
  
  // Estados de dados
  const [posts, setPosts] = useState<RevistaPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalArticlesExist, setTotalArticlesExist] = useState(false);
  
  // AbortController para cancelar requests
  const abortRef = useRef<AbortController | null>(null);
  
  const { getCachedData, setCachedData, restoreScrollPosition, clearCache } = useRevistaCache();

  // Chave estável para efeitos
  const fKey = useMemo(
    () => `${filters.q}|${filters.secao}|${filters.sort}`,
    [filters.q, filters.secao, filters.sort]
  );

  // Hidratação única protegida
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    const fromUrl = readFromURL(searchParams);
    setFilters(prev => shallowEqual(prev, fromUrl) ? prev : fromUrl);
  }, []);

  // Sincronização com URL apenas quando fKey muda
  useEffect(() => {
    const qs = toQS(filters);
    const current = typeof window !== "undefined"
      ? window.location.search.replace(/^\?/, "")
      : "";
    if (qs !== current) {
      navigate(qs ? `?${qs}` : "?", { replace: true });
    }
  }, [fKey, navigate, filters]);

  // Infinite scroll setup
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchPosts({ offset: posts.length, reset: false, filters, signal: abortRef.current?.signal });
    }
  };

  const { targetRef, isEnabled: isInfiniteScrollEnabled, enableInfiniteScroll, disableInfiniteScroll } = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore,
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Check if there are any articles in the CMS
  useEffect(() => {
    const checkTotalArticles = async () => {
      const { count } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      
      setTotalArticlesExist((count || 0) > 0);
    };
    
    checkTotalArticles();
  }, []);

  // Fetch com debounce e AbortController integrados
  const fetchPosts = async ({
    offset,
    reset,
    filters,
    signal,
  }: {
    offset: number;
    reset: boolean;
    filters: Filters;
    signal?: AbortSignal;
  }) => {
    console.log(`[DEBUG] fetchPosts chamado: offset=${offset}, reset=${reset}`, filters);

    try {
      if (reset) {
        setIsLoading(true);
        clearCache();
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(offset, offset + 11); // 12 items (0-11)

      if (filters.q) {
        query = query.ilike('title', `%${filters.q}%`);
      }
      
      if (filters.secao) {
        query = query.eq('blog_post_categories.blog_categories.name', filters.secao);
      }

      const { data, error: fetchError, count } = await query;

      if (signal?.aborted) {
        console.log('[DEBUG] Request abortado');
        return;
      }

      if (fetchError) {
        console.warn('Erro na consulta de posts:', fetchError);
        const fallbackData: RevistaPost[] = [];
        setPosts(currentPosts => reset ? fallbackData : [...currentPosts, ...fallbackData]);
        setTotalCount(0);
        setHasMore(false);
        return;
      }

      const transformedPosts: RevistaPost[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.summary,
        summary: item.summary,
        cover_url: item.cover_image,
        cover_image: item.cover_image,
        publish_at: item.published_at,
        published_at: item.published_at,
        reading_time_min: item.reading_time || 5,
        reading_time: item.reading_time || 5,
        city: item.city,
        slug: item.slug,
        slug_data: item.slug_data,
        author_name: item.author_name,
        featured: item.featured || false,
      }));

      setPosts(currentPosts => {
        const newPosts = reset ? transformedPosts : [...currentPosts, ...transformedPosts];
        console.log(`[DEBUG] Posts updated: ${newPosts.length} items`);
        
        // Cache de forma assíncrona
        requestAnimationFrame(() => {
          setCachedData(newPosts, count || 0, transformedPosts.length === 12 && (offset + 12) < (count || 0));
        });
        
        return newPosts;
      });

      const newHasMore = transformedPosts.length === 12 && (offset + 12) < (count || 0);
      setTotalCount(count || 0);
      setHasMore(newHasMore);

    } catch (err) {
      if (signal?.aborted) return;
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar artigos');
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  // Initial load with cache check - só uma vez
  useEffect(() => {
    console.log('[DEBUG] Initial load useEffect triggered');
    
    const cachedData = getCachedData();
    if (cachedData) {
      console.log('[DEBUG] Using cached data:', cachedData.posts.length);
      setPosts(cachedData.posts);
      setTotalCount(cachedData.totalCount);
      setHasMore(cachedData.hasMore);
      setIsLoading(false);
      
      requestAnimationFrame(() => {
        restoreScrollPosition(cachedData.scrollPosition);
      });
    } else {
      console.log('[DEBUG] No cache, fetching posts');
      abortRef.current = new AbortController();
      fetchPosts({ offset: 0, reset: true, filters, signal: abortRef.current.signal });
    }
  }, []); // Sem dependências para evitar loops

  // Fetch com debounce quando filtros mudam
  useEffect(() => {
    const t = setTimeout(() => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      fetchPosts({ offset: 0, reset: true, filters, signal: abortRef.current.signal });
    }, 250);
    return () => clearTimeout(t);
  }, [fKey]); // Só quando a chave muda

  // Handlers idempotentes - não setam estado igual
  const onSearchChange = (v: string) =>
    setFilters(prev => (prev.q === v ? prev : { ...prev, q: v }));

  const onSectionChange = (v: string) =>
    setFilters(prev => (prev.secao === v ? prev : { ...prev, secao: v }));

  const handleClearFilters = () => {
    setFilters({ q: "", secao: "", sort: "recent" });
  };

  const handleViewAll = () => {
    setFilters({ q: "", secao: "", sort: "recent" });
  };

  const handleRetry = () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    fetchPosts({ offset: 0, reset: true, filters, signal: abortRef.current.signal });
  };

  const hasFilters = filters.q || filters.secao || (filters.sort && filters.sort !== "recent");

  const metaDescription = hasFilters 
    ? `Resultados de busca na Revista ROLÊ${filters.q ? ` para "${filters.q}"` : ''}${filters.secao ? ` sobre ${filters.secao}` : ''}` 
    : "Mergulhos em cultura, música e noite no Brasil. Descubra as melhores matérias sobre a cena cultural.";

  // Generate JSON-LD ItemList for SEO when articles exist
  const itemListSchema = posts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": Math.min(posts.length, 10),
    "itemListElement": posts.slice(0, 10).map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": post.title,
        "description": post.summary,
        "image": post.cover_image,
        "author": {
          "@type": "Person",
          "name": post.author_name || "ROLÊ"
        },
        "publisher": {
          "@type": "Organization",
          "name": "ROLÊ",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/role-logo.png`
          }
        },
        "datePublished": post.published_at,
        "url": `${window.location.origin}/revista/${post.slug}`
      }
    }))
  } : undefined;

  return (
    <PublicLayout>
      <SEOHelmet
        title="Revista ROLÊ"
        description={metaDescription}
        url="https://roleentretenimento.com/revista"
        type="website"
        structuredData={itemListSchema}
      />
      
      {/* Add noindex when no articles exist */}
      {!totalArticlesExist && (
        <meta name="robots" content="noindex, follow" />
      )}
      
      <div className="container mx-auto max-w-5xl px-4 md:px-6 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-4xl font-bold">Revista ROLÊ</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mergulhos em cultura, música e noite no Brasil.
            </p>
          </div>

          {/* Filters - sticky with blur effect */}
          {totalArticlesExist && (
            <div className="sticky top-16 z-20 mb-8 rounded-xl border bg-background/80 backdrop-blur-md shadow-sm">
              <div className="p-4">
            <RevistaFilters
              searchTerm={filters.q}
              sectionFilter={filters.secao}
              onSearchChange={onSearchChange}
              onSectionChange={onSectionChange}
              onClearFilters={handleClearFilters}
            />
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar artigos</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRetry} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Results summary - only show if there are articles */}
          {totalArticlesExist && !error && (
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>
                {isLoading ? 'Carregando...' : `${totalCount} artigo${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`}
                {hasFilters && ' para sua busca'}
              </span>
            </div>
          )}

          {/* Loading skeletons - only show if no items loaded yet */}
          {isLoading && posts.length === 0 && (
            <ResponsiveGrid 
              cols={{ default: 1, md: 2, lg: 3 }}
              gap="lg"
              className="mb-8"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <div 
                  key={i} 
                  className={`
                    ${i < 3 ? 'block' : 'hidden md:block'}
                  `}
                >
                  <RevistaCardSkeleton />
                </div>
              ))}
            </ResponsiveGrid>
          )}

          {/* Empty state */}
          {!error && !isLoading && posts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              
              {!totalArticlesExist ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Nenhum artigo publicado</h3>
                  <p className="text-muted-foreground mb-6">
                    Estamos preparando conteúdos novos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg">
                      <Link to="/agenda" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Voltar para a Agenda
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="gap-2"
                      onClick={() => {
                        // TODO: Implementar modal de newsletter
                        console.log('Abrir modal de newsletter');
                      }}
                    >
                      <Mail className="w-4 h-4" />
                      Assinar newsletter
                    </Button>
                  </div>
                </>
              ) : hasFilters ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
                  <p className="text-muted-foreground mb-6">
                    Tente mudar a seção ou limpe os filtros.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleClearFilters} variant="outline">
                      Limpar filtros
                    </Button>
                    <Button onClick={handleViewAll} variant="default">
                      Ver todos
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">Nenhum artigo publicado</h3>
                  <p className="text-muted-foreground mb-4">
                    Volte em breve para conferir novos conteúdos.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Articles grid with accessibility - show even while loading more */}
          {!error && posts.length > 0 && (
            <>
              <div 
                role="list" 
                aria-label={`Lista de ${totalCount} artigo${totalCount !== 1 ? 's' : ''} da revista`}
                id="revista-articles-list"
              >
                <ResponsiveGrid 
                  cols={{ default: 1, md: 2, lg: 3 }}
                  gap="lg"
                  className="mb-8"
                >
                  {posts.map((post) => (
                    <div key={post.id} role="listitem">
                      <RevistaCard post={post} />
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>

              {/* Load more section with infinite scroll trigger */}
              {hasMore && (
                <div className="flex flex-col items-center gap-4">
                  {/* Manual load more button */}
                  <Button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    size="lg"
                    aria-label={`Carregar mais artigos. ${posts.length} de ${totalCount} artigos carregados`}
                  >
                    {isLoadingMore ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Carregando...
                      </>
                    ) : (
                      'Carregar mais artigos'
                    )}
                  </Button>

                  {/* Infinite scroll controls */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isInfiniteScrollEnabled ? disableInfiniteScroll : enableInfiniteScroll}
                      className="text-xs"
                    >
                      {isInfiniteScrollEnabled ? 'Desabilitar scroll infinito' : 'Habilitar scroll infinito'}
                    </Button>
                  </div>

                  {/* Invisible trigger for infinite scroll */}
                  <div 
                    ref={targetRef} 
                    className="h-4 w-full opacity-0"
                    aria-hidden="true"
                  />
                </div>
              )}
            </>
          )}
        </div>
    </PublicLayout>
  );
}