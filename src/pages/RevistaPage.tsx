import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase";
import ArticleCard, { Article } from "../features/revista/ArticleCard";
import SkeletonGrid from "../features/revista/SkeletonGrid";
import EmptyState from "../features/revista/EmptyState";
import FiltersBar, { Filters } from "../features/revista/FiltersBar";

type DBRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string;
  section: string;
  reading_time: number | null;
  published_at: string;
  status?: string;
  reads?: number | null;
  saves?: number | null;
};

export default function RevistaPage() {
  const [filters, setFilters] = useState<Filters>({ q: "", section: "", sort: "recent" });
  const [items, setItems] = useState<Article[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const fKey = useMemo(() => `${filters.q}|${filters.section}|${filters.sort}`, [filters]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    const watchdog = setTimeout(() => setLoading(false), 8000); // nunca travar

    async function run() {
      if (!supabaseReady) {
        setErr("Configuração do Supabase ausente");
        setItems([]);
        setLoading(false);
        return;
      }

      let q = supabase
        .from("posts_public")
        .select("id, slug, title, excerpt, cover_url, section, reading_time, published_at", { count: "exact" })
        .eq("status", "published");

      if (filters.section) q = q.eq("section", filters.section);
      if (filters.q) q = q.ilike("title", `%${filters.q}%`);

      const sortCol =
        filters.sort === "most_read" ? "reads" :
        filters.sort === "most_saved" ? "saves" : "published_at";

      // se a coluna de ordenação não existir, não quebra
      try {
        const { data, error, count } = await q.order(sortCol as any, { ascending: false }).range(0, 11);

        if (!alive) return;

        if (error) {
          console.error("[revista] db_error", error);
          setErr("Não foi possível carregar agora");
          setItems([]);
          setTotal(0);
        } else {
          const mapped = (data ?? []).map((r: DBRow): Article => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            excerpt: r.excerpt || '',
            coverUrl: r.cover_url || '',
            section: r.section as Article["section"],
            readingTimeMin: r.reading_time ?? undefined,
            dateISO: r.published_at,
          }));
          setItems(mapped);
          setTotal(count ?? mapped.length);
        }
      } catch (e) {
        if (!alive) return;
        console.error("[revista] fetch exception", e);
        setErr("Não foi possível carregar agora");
        setItems([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
        clearTimeout(watchdog);
      }
    }

    // debounce leve
    const t = setTimeout(run, 200);
    return () => { alive = false; clearTimeout(t); clearTimeout(watchdog); };
  }, [fKey]);

  const showSkeleton = loading && items.length === 0;

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-10 grid gap-8">
      <header className="grid gap-2">
        <h1 className="text-3xl font-bold">Revista ROLÊ</h1>
        <p className="text-gray-600">Mergulhos em cultura, música e noite no Brasil.</p>
      </header>

      <FiltersBar initial={filters} count={total} onChange={(f) => setFilters(f)} />

      {showSkeleton ? (
        <SkeletonGrid count={6} />
      ) : err ? (
        <div className="text-center py-16 grid gap-2">
          <h3 className="text-lg font-semibold">Erro ao carregar artigos</h3>
          <p className="text-sm text-gray-600">{err}</p>
          <button className="px-4 py-2 rounded-md border" onClick={() => location.reload()}>Tentar novamente</button>
        </div>
      ) : items.length ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((a) => <ArticleCard key={a.id} a={a} />)}
        </section>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}