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
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, AlertCircle, Calendar, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  summary?: string;
  cover_url: string;
  cover_image?: string;
  published_at: string;
  reading_time_min: number;
  reading_time?: number;
  city: string;
  slug: string;
  author_name?: string;
}

type Filters = { q: string; section: string; sort: string };

function readFromURL(sp: URLSearchParams): Filters {
  return {
    q: sp.get("q") ?? "",
    section: sp.get("section") ?? "",
    sort: sp.get("sort") ?? "recent",
  };
}

function normalize(f: Filters) {
  const out: Record<string, string> = {};
  if (f.q) out.q = f.q;
  if (f.section) out.section = f.section;
  if (f.sort && f.sort !== 'recent') out.sort = f.sort;
  return out;
}

function toQS(f: Filters) {
  const entries = Object.entries(normalize(f)).sort(([a], [b]) => a.localeCompare(b));
  return new URLSearchParams(entries).toString();
}

function shallowEqual(a: Filters, b: Filters) {
  return a.q === b.q && a.section === b.section && a.sort === b.sort;
}

export default function RevistaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estado com filtros únicos
  const [filters, setFilters] = useState<Filters>(() => readFromURL(searchParams));
  const didHydrate = useRef(false);
  
  // Estados de dados simplificados
  const [items, setItems] = useState<Article[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Chave dos filtros
  const fKey = `${filters.q}|${filters.section}|${filters.sort}`;

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

  // Fetch principal
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErrorMsg(null);

    const t = setTimeout(async () => {
      try {
        let q = supabase
          .from("blog_posts")
          .select("id, slug, title, summary, cover_image, city, reading_time, published_at", { count: "exact" })
          .eq("status", "published");

        if (filters.section) q = q.eq("city", filters.section);
        if (filters.q) q = q.ilike("title", `%${filters.q}%`);

        const sortCol = filters.sort === "most_read" ? "views" : "published_at";
        q = q.order(sortCol as "published_at", { ascending: false }).range(0, 11);

        const { data, error, count } = await q;

        if (!alive) return;

        if (error) {
          console.error("[revista] db_error", error);
          setItems([]);
          setTotal(0);
          setErrorMsg("Não foi possível carregar agora.");
        } else {
          // mapeia para camelCase usado no front
          setItems((data ?? []).map(r => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            excerpt: r.summary || '',
            cover_url: r.cover_image || '',
            city: r.city || '',
            reading_time_min: r.reading_time || 5,
            published_at: r.published_at || '',
          })));
          setTotal(count ?? 0);
        }
      } catch (error) {
        if (!alive) return;
        console.error("[revista] fetch error", error);
        setErrorMsg("Não foi possível carregar agora.");
      }
      setLoading(false);
    }, 250);

    return () => { alive = false; clearTimeout(t); };
  }, [fKey]);

  // Handlers idempotentes
  const onSearchChange = (v: string) =>
    setFilters(prev => (prev.q === v ? prev : { ...prev, q: v }));

  const onSectionChange = (v: string) =>
    setFilters(prev => (prev.section === v ? prev : { ...prev, section: v }));

  const handleClearFilters = () => {
    setFilters({ q: "", section: "", sort: "recent" });
  };

  const hasFilters = filters.q || filters.section || (filters.sort && filters.sort !== "recent");

  // Regra de render - skeleton só se ainda não há itens
  const showSkeleton = loading && items.length === 0;

  const metaDescription = hasFilters 
    ? `Resultados de busca na Revista ROLÊ${filters.q ? ` para "${filters.q}"` : ''}${filters.section ? ` sobre ${filters.section}` : ''}` 
    : "Mergulhos em cultura, música e noite no Brasil. Descubra as melhores matérias sobre a cena cultural.";

  // Generate JSON-LD ItemList for SEO when articles exist
  const itemListSchema = items.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": Math.min(items.length, 10),
    "itemListElement": items.slice(0, 10).map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.cover_url,
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
      {items.length === 0 && !loading && (
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
          {items.length > 0 && (
            <div className="sticky top-16 z-20 mb-8 rounded-xl border bg-background/80 backdrop-blur-md shadow-sm">
              <div className="p-4">
            <RevistaFilters
              searchTerm={filters.q}
              sectionFilter={filters.section}
              onSearchChange={onSearchChange}
              onSectionChange={onSectionChange}
              onClearFilters={handleClearFilters}
            />
              </div>
            </div>
          )}

          {/* Error state */}
          {errorMsg && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar artigos</h3>
              <p className="text-muted-foreground mb-4">{errorMsg}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Results summary - only show if there are articles */}
          {items.length > 0 && !errorMsg && (
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>
                {loading ? 'Carregando...' : `${total} artigo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
                {hasFilters && ' para sua busca'}
              </span>
            </div>
          )}

          {/* Content */}
          {showSkeleton ? (
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
          ) : items.length ? (
            <ResponsiveGrid 
              cols={{ default: 1, md: 2, lg: 3 }}
              gap="lg"
              className="mb-8"
            >
              {items.map((post) => (
                <div key={post.id} role="listitem">
                  <RevistaCard post={{
                    ...post,
                    summary: post.excerpt,
                    cover_image: post.cover_url,
                    reading_time: post.reading_time_min
                  }} />
                </div>
              ))}
            </ResponsiveGrid>
          ) : (
            <div className="text-center py-16 grid gap-2">
              <h3 className="text-lg font-semibold">Nenhum artigo encontrado</h3>
              <p className="text-sm text-muted-foreground">{errorMsg ?? "Ajuste os filtros ou tente mais tarde."}</p>
              <button 
                onClick={handleClearFilters} 
                className="px-4 py-2 rounded-md border mx-auto"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
    </PublicLayout>
  );
}