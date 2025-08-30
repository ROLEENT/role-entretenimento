import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SEOHelmet } from "@/components/SEOHelmet";
import { PublicLayout } from "@/components/PublicLayout";
import { RevistaCard } from "@/components/revista/RevistaCard";
import { RevistaCardSkeleton } from "@/components/revista/RevistaCardSkeleton";
import { RevistaFilters } from "@/components/revista/RevistaFilters";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";
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

export default function RevistaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<RevistaPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalArticlesExist, setTotalArticlesExist] = useState(false);
  const [lastFetchRef, setLastFetchRef] = useState<string>('');
  
  const searchTerm = searchParams.get('q') || '';
  const cityFilter = searchParams.get('cidade') || '';
  const sectionFilter = searchParams.get('secao') || '';
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { getCachedData, setCachedData, restoreScrollPosition, clearCache } = useRevistaCache();

  // Infinite scroll setup
  const { targetRef, isEnabled: isInfiniteScrollEnabled, enableInfiniteScroll, disableInfiniteScroll } = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: () => handleLoadMore(),
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

  const fetchPosts = useCallback(async (offset = 0, reset = false) => {
    // Generate unique fetch reference to prevent duplicates
    const fetchRef = `${offset}-${reset}-${cityFilter}-${debouncedSearchTerm}`;
    if (fetchRef === lastFetchRef && !reset) {
      return; // Prevent duplicate requests
    }

    try {
      if (reset) {
        setIsLoading(true);
        clearCache(); // Clear cache when filters change
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      setLastFetchRef(fetchRef);

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(offset, offset + 11); // 12 items (0-11)

      if (cityFilter) {
        query = query.eq('city', cityFilter);
      }

      if (debouncedSearchTerm) {
        query = query.ilike('title', `%${debouncedSearchTerm}%`);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

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

      const newPosts = reset ? transformedPosts : [...posts, ...transformedPosts];
      const newHasMore = transformedPosts.length === 12 && (offset + 12) < (count || 0);

      setPosts(newPosts);
      setTotalCount(count || 0);
      setHasMore(newHasMore);

      // Cache the data for future visits
      setCachedData(newPosts, count || 0, newHasMore);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar artigos');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [cityFilter, debouncedSearchTerm, lastFetchRef, posts, clearCache, setCachedData]);

  // Try to restore from cache on initial load
  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setPosts(cachedData.posts);
      setTotalCount(cachedData.totalCount);
      setHasMore(cachedData.hasMore);
      setIsLoading(false);
      restoreScrollPosition(cachedData.scrollPosition);
    } else {
      fetchPosts(0, true);
    }
  }, [fetchPosts, getCachedData, restoreScrollPosition]);

  // Re-fetch when filters change (but not on initial load if cache exists)
  useEffect(() => {
    const cachedData = getCachedData();
    if (!cachedData) {
      fetchPosts(0, true);
    }
  }, [cityFilter, debouncedSearchTerm]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchPosts(posts.length);
    }
  };

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => updateSearchParams('q', value);
  const handleCityChange = (value: string) => updateSearchParams('cidade', value);
  const handleSectionChange = (value: string) => updateSearchParams('secao', value);

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handleViewAll = () => {
    setSearchParams({});
  };

  const handleRetry = () => {
    fetchPosts(0, true);
  };

  const hasFilters = searchTerm || cityFilter || sectionFilter;

  const metaDescription = hasFilters 
    ? `Resultados de busca na Revista ROLÊ${searchTerm ? ` para "${searchTerm}"` : ''}${cityFilter ? ` em ${cityFilter}` : ''}` 
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
      
      <div className="container mx-auto px-4 py-8">
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

          {/* Filters - only show if there are articles */}
          {totalArticlesExist && (
            <div className="mb-8">
              <RevistaFilters
                searchTerm={searchTerm}
                cityFilter={cityFilter}
                sectionFilter={sectionFilter}
                onSearchChange={handleSearchChange}
                onCityChange={handleCityChange}
                onSectionChange={handleSectionChange}
                onClearFilters={handleClearFilters}
              />
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

          {/* Loading skeletons */}
          {isLoading && (
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
                    Tente mudar cidade ou seção, ou limpe os filtros.
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

          {/* Articles grid with accessibility */}
          {!error && !isLoading && posts.length > 0 && (
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