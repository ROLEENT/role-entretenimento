import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ArticleCard from "../features/revista/ArticleCard";
import SkeletonGrid from "../features/revista/SkeletonGrid";
import EmptyState from "../features/revista/EmptyState";
import FiltersBar, { Filters } from "../features/revista/FiltersBar";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = createClient(url || "", anon || "", { auth: { persistSession: false } });

type Row = {
  id: string; slug: string; title: string; excerpt: string;
  cover_url?: string | null;
  coverUrl?: string | null; // fallback se a coluna já estiver camelCase
  section: "editorial" | "posfacio" | "fala" | "bpm" | "achadinhos";
  reading_time_min?: number | null;
  readingTimeMin?: number | null;
  published_at?: string; dateISO?: string;
  status?: string | null;
  reads?: number | null; saves?: number | null;
};

export default function RevistaPage() {
  const [filters, setFilters] = useState<Filters>({ q: "", section: "", sort: "recent" });
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fKey = useMemo(() => `${filters.q}|${filters.section}|${filters.sort}`, [filters.q, filters.section, filters.sort]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    const watchdog = setTimeout(() => setLoading(false), 8000);

    async function run() {
      if (!url || !anon) {
        setErr("Ambiente sem VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY");
        setItems([]); setLoading(false); return;
      }

      // Select básico SEM alias para não quebrar em views
      let q = supabase
        .from("posts_public")
        .select("id, slug, title, excerpt, cover_url, coverUrl, section, reading_time_min, readingTimeMin, published_at, dateISO, status, reads, saves", { count: "exact" });

      // Filtro por seção se existir
      if (filters.section) q = q.eq("section", filters.section);

      // Se a coluna "status" existir na view, filtra published. Se não, segue sem filtrar.
      const testStatus = await supabase.from("posts_public").select("status").limit(0);
      if (!testStatus.error) q = q.eq("status", "published");

      // Busca textual simples
      if (filters.q) q = q.ilike("title", `%${filters.q}%`);

      // Ordenação com fallback
      const sortCol =
        filters.sort === "most_read" ? "reads" :
        filters.sort === "most_saved" ? "saves" : "published_at";
      const { data, error, count } = await q.order(sortCol as any, { ascending: false }).range(0, 11);

      if (!alive) return;

      if (error) {
        console.error("[revista] db_error", error);
        setErr("Não foi possível carregar agora");
        setItems([]); setTotal(0);
      } else {
        const mapped = (data ?? []).map((r: Row) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt,
          coverUrl: r.cover_url ?? r.coverUrl ?? "",
          section: r.section,
          readingTimeMin: r.reading_time_min ?? r.readingTimeMin ?? undefined,
          dateISO: r.published_at ?? r.dateISO ?? new Date().toISOString(),
        }));
        setItems(mapped);
        setTotal(count ?? mapped.length);
      }
      setLoading(false);
      clearTimeout(watchdog);
    }

    run();
    return () => { alive = false; clearTimeout(watchdog); };
  }, [fKey]);

  const showSkeleton = loading && items.length === 0;

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-10 grid gap-8">
      <header className="grid gap-2">
        <h1 className="text-3xl font-bold">Revista ROLÊ</h1>
        <p className="text-gray-600">Mergulhos em cultura, música e noite no Brasil.</p>
      </header>

      <FiltersBar initial={filters} count={total} onChange={setFilters} />

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