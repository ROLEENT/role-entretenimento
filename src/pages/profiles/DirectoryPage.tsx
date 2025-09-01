import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import ProfileCard from "@/features/profiles/ProfileCard";
import { ProfileType } from "@/features/profiles/api";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import Chip from "@/components/ui/chip";

export default function DirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  const [q, setQ] = useState(searchParams.get('q') || "");
  const [type, setType] = useState<ProfileType | "">(searchParams.get('type') as ProfileType || "");
  const [city, setCity] = useState(searchParams.get('city') || "");
  const [order, setOrder] = useState<"trend" | "followers" | "az">("trend");
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<any[]>([]);

  const filters = useMemo(() => ({
    q: q || undefined,
    type: type || undefined,
    city: city || undefined,
    order,
    limit: 24,
    offset,
  }), [q, type, city, order, offset]);

  const { data, isLoading, error } = useProfiles(filters);
  const profiles = data?.data || [];
  const total = data?.total || 0;

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && items.length < total && !isLoading) {
        setOffset(o => o + 24);
      }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [items.length, total, isLoading]);

  // Update items when data changes
  useEffect(() => {
    if (offset === 0) {
      setItems(profiles);
    } else {
      setItems(prev => [...prev, ...profiles]);
    }
  }, [profiles, offset]);

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('type', type);
    if (city) params.set('city', city);
    setSearchParams(params);
  };

  const resetFilters = () => {
    setQ("");
    setType("");
    setCity("");
    setOrder("trend");
    setOffset(0);
    setItems([]);
    setSearchParams(new URLSearchParams());
  };

  const handleFilterChange = (newFilters: {
    q?: string;
    type?: string;
    city?: string;
    order?: "trend" | "followers" | "az";
  }) => {
    if (newFilters.q !== undefined) setQ(newFilters.q);
    if (newFilters.type !== undefined) setType(newFilters.type as ProfileType | "");
    if (newFilters.city !== undefined) setCity(newFilters.city);
    if (newFilters.order !== undefined) setOrder(newFilters.order);
    setOffset(0);
    setItems([]);
    updateSearchParams();
  };

  if (!isLoading && !items.length && offset === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          <Helmet>
            <title>Perfis - ROLÊ</title>
            <meta name="description" content="Artistas, organizadores e locais. Siga quem você curte." />
          </Helmet>

          {/* Header */}
          <header className="grid gap-4">
            <h1 className="text-3xl font-bold">Perfis</h1>
            <p className="text-muted-foreground">Artistas, organizadores e locais</p>

            {/* Tabs de tipo */}
            <SegmentedTabs
              items={[
                { label: "Todos", value: "" },
                { label: "Artistas", value: "artista" },
                { label: "Organizadores", value: "organizador" },
                { label: "Locais", value: "local" },
              ]}
              value={type}
              onChange={(v) => handleFilterChange({ type: v })}
            />

            {/* Cidades frequentes */}
            <div className="flex flex-wrap gap-2 pt-1">
              {["Porto Alegre", "São Paulo", "Rio de Janeiro", "Florianópolis", "Curitiba"].map(c => (
                <Chip 
                  key={c} 
                  active={city === c} 
                  onClick={() => handleFilterChange({ city: c })}
                >
                  {c}
                </Chip>
              ))}
              {city && (
                <button 
                  className="text-sm underline text-muted-foreground hover:text-foreground"
                  onClick={() => handleFilterChange({ city: "" })}
                >
                  Limpar cidade
                </button>
              )}
            </div>
          </header>

          {/* Barra de filtros sticky */}
          <section className="sticky top-2 z-20">
            <div className="rounded-2xl border border-border p-4 md:p-5 bg-card shadow-sm grid gap-3">
              <div className="grid gap-3 md:grid-cols-4">
                {/* Buscar */}
                <label className="md:col-span-2 relative">
                  <span className="sr-only">Buscar por nome</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange({ q })}
                    placeholder="Buscar por nome"
                    className="h-10 w-full rounded-md border border-border bg-background px-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </label>

                {/* Ordenar */}
                <select
                  value={order}
                  onChange={(e) => handleFilterChange({ order: e.target.value as any })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="trend">Em alta</option>
                  <option value="followers">Mais seguidos</option>
                  <option value="az">A a Z</option>
                </select>

                {/* Cidade livre */}
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilterChange({ city })}
                  placeholder="Cidade"
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Chips de filtros ativos + contagem */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  {q && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Busca: {q}</span>}
                  {type && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Tipo: {type}</span>}
                  {city && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Cidade: {city}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <p aria-live="polite" className="text-sm text-muted-foreground">
                    {total} resultado{total === 1 ? "" : "s"}
                  </p>
                  {(q || type || city) && (
                    <button 
                      onClick={resetFilters}
                      className="h-8 px-3 rounded-md border border-border text-sm hover:bg-muted"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Empty State */}
          <div className="text-center py-20 grid gap-3">
            <h3 className="text-lg font-semibold">Nenhum perfil encontrado</h3>
            <p className="text-sm text-muted-foreground">Ajuste filtros ou busque por outro nome.</p>
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={resetFilters}
                className="px-4 py-2 rounded-md border border-border hover:bg-muted"
              >
                Limpar tudo
              </button>
              <a 
                href="/criar/perfil" 
                className="px-4 py-2 rounded-md border bg-foreground text-background hover:bg-foreground/90"
              >
                Criar perfil
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <Helmet>
          <title>Perfis - ROLÊ</title>
          <meta name="description" content="Artistas, organizadores e locais. Siga quem você curte." />
        </Helmet>

        {/* Header */}
        <header className="grid gap-4">
          <h1 className="text-3xl font-bold">Perfis</h1>
          <p className="text-muted-foreground">Artistas, organizadores e locais</p>

          {/* Tabs de tipo */}
          <SegmentedTabs
            items={[
              { label: "Todos", value: "" },
              { label: "Artistas", value: "artista" },
              { label: "Organizadores", value: "organizador" },
              { label: "Locais", value: "local" },
            ]}
            value={type}
            onChange={(v) => handleFilterChange({ type: v })}
          />

          {/* Cidades frequentes */}
          <div className="flex flex-wrap gap-2 pt-1">
            {["Porto Alegre", "São Paulo", "Rio de Janeiro", "Florianópolis", "Curitiba"].map(c => (
              <Chip 
                key={c} 
                active={city === c} 
                onClick={() => handleFilterChange({ city: c })}
              >
                {c}
              </Chip>
            ))}
            {city && (
              <button 
                className="text-sm underline text-muted-foreground hover:text-foreground"
                onClick={() => handleFilterChange({ city: "" })}
              >
                Limpar cidade
              </button>
            )}
          </div>
        </header>

        {/* Barra de filtros sticky */}
        <section className="sticky top-2 z-20">
          <div className="rounded-2xl border border-border p-4 md:p-5 bg-card shadow-sm grid gap-3">
            <div className="grid gap-3 md:grid-cols-4">
              {/* Buscar */}
              <label className="md:col-span-2 relative">
                <span className="sr-only">Buscar por nome</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilterChange({ q })}
                  placeholder="Buscar por nome"
                  className="h-10 w-full rounded-md border border-border bg-background px-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </label>

              {/* Ordenar */}
              <select
                value={order}
                onChange={(e) => handleFilterChange({ order: e.target.value as any })}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="trend">Em alta</option>
                <option value="followers">Mais seguidos</option>
                <option value="az">A a Z</option>
              </select>

              {/* Cidade livre */}
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange({ city })}
                placeholder="Cidade"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Chips de filtros ativos + contagem */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2 text-sm">
                {q && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Busca: {q}</span>}
                {type && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Tipo: {type}</span>}
                {city && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Cidade: {city}</span>}
              </div>
              <div className="flex items-center gap-3">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  {total} resultado{total === 1 ? "" : "s"}
                </p>
                {(q || type || city) && (
                  <button 
                    onClick={resetFilters}
                    className="h-8 px-3 rounded-md border border-border text-sm hover:bg-muted"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Skeletons */}
        {isLoading && !items.length ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[3/1] bg-muted" />
                <div className="p-4 grid gap-2">
                  <div className="h-4 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </section>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar perfis</p>
          </div>
        ) : (
          <>
            {/* Grid de perfis */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((profile) => (
                <ProfileCard key={profile.id} p={profile} />
              ))}
            </section>
            
            {/* Sentinel para infinite scroll */}
            <div ref={sentinelRef} className="h-10" />
            
            {/* Loading mais perfis */}
            {isLoading && items.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}