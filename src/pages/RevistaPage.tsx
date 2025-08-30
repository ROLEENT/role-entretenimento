import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SEOHelmet } from "@/components/SEOHelmet";
import { PageWrapper } from "@/components/PageWrapper";
import { RevistaCard } from "@/components/revista/RevistaCard";
import { RevistaCardSkeleton } from "@/components/revista/RevistaCardSkeleton";
import { RevistaFilters } from "@/components/revista/RevistaFilters";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";
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
  
  const searchTerm = searchParams.get('q') || '';
  const cityFilter = searchParams.get('cidade') || '';
  const sectionFilter = searchParams.get('secao') || '';
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
    try {
      if (reset) {
        setIsLoading(true);
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

      if (reset) {
        setPosts(transformedPosts);
      } else {
        setPosts(prev => [...prev, ...transformedPosts]);
      }
      
      setTotalCount(count || 0);
      setHasMore(transformedPosts.length === 12 && (offset + 12) < (count || 0));
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar artigos');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [cityFilter, debouncedSearchTerm]);

  // Load initial posts
  useEffect(() => {
    fetchPosts(0, true);
  }, [fetchPosts]);

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
    : "Revista ROLÊ - Artigos sobre cultura, música e entretenimento. Descubra as melhores matérias sobre a cena cultural do Brasil.";

  return (
    <>
      <SEOHelmet
        title="Revista ROLÊ - Cultura, Música e Entretenimento"
        description={metaDescription}
        url="https://roleentretenimento.com/revista"
        type="website"
      />
      
      <PageWrapper>
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

              {/* Load more button */}
              {hasMore && (
                <div className="flex justify-center">
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
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
}