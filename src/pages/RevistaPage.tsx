import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SEOHelmet } from "@/components/SEOHelmet";
import { PageWrapper } from "@/components/PageWrapper";
import { RevistaCard } from "@/components/revista/RevistaCard";
import { RevistaFilters } from "@/components/revista/RevistaFilters";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRevistaData } from "@/hooks/useRevistaData";
import { BookOpen, FileText } from "lucide-react";

export default function RevistaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchTerm = searchParams.get('q') || '';
  const cityFilter = searchParams.get('cidade') || '';
  const sectionFilter = searchParams.get('secao') || '';
  const page = parseInt(searchParams.get('pagina') || '1', 10);

  const { posts, totalCount, totalPages, isLoading, error } = useRevistaData({
    searchTerm,
    cityFilter,
    sectionFilter,
    page,
    limit: 12
  });

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // Reset to page 1 when filters change
    if (key !== 'pagina') {
      newParams.delete('pagina');
    }
    
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => updateSearchParams('q', value);
  const handleCityChange = (value: string) => updateSearchParams('cidade', value);
  const handleSectionChange = (value: string) => updateSearchParams('secao', value);
  
  const handlePageChange = (newPage: number) => {
    updateSearchParams('pagina', newPage.toString());
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  if (error) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar artigos</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Revista ROLÊ</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mergulhe no universo da cultura, música e entretenimento. 
              Descubra artigos exclusivos sobre a cena que move o Brasil.
            </p>
          </div>

          {/* Filters */}
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

          {/* Results summary */}
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>
              {isLoading ? 'Carregando...' : `${totalCount} artigo${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`}
              {hasFilters && ' para sua busca'}
            </span>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {hasFilters ? 'Nenhum artigo encontrado' : 'Nenhum artigo publicado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasFilters 
                  ? 'Tente ajustar seus filtros de busca.' 
                  : 'Volte em breve para conferir novos conteúdos.'
                }
              </p>
              {hasFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="text-primary hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* Articles grid */}
          {!isLoading && posts.length > 0 && (
            <>
              <ResponsiveGrid 
                cols={{ default: 1, md: 2, lg: 3, xl: 4 }}
                gap="lg"
                className="mb-8"
              >
                {posts.map((post) => (
                  <RevistaCard key={post.id} post={post} />
                ))}
              </ResponsiveGrid>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(page - 1)}
                            href="#"
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                        if (pageNumber > totalPages) return null;
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNumber)}
                              isActive={pageNumber === page}
                              href="#"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {page < totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(page + 1)}
                            href="#"
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
}