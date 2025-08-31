import React, { useEffect, useId, useState } from "react";

export type Filters = { q: string; section: string; sort: "recent" | "most_read" | "most_saved" };

export default function FiltersBar({
  initial,
  onChange,
  count
}: {
  initial?: Partial<Filters>;
  onChange: (f: Filters) => void;
  count?: number;
}) {
  const [q, setQ] = useState(initial?.q ?? "");
  const [section, setSection] = useState(initial?.section ?? "");
  const [sort, setSort] = useState<Filters["sort"]>(initial?.sort ?? "recent");
  const liveId = useId();

  useEffect(() => { onChange({ q, section, sort }); }, [q, section, sort, onChange]);

  return (
    <div className="rounded-3xl border p-4 md:p-6 grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600" id={liveId} aria-live="polite">
          {typeof count === "number" ? `${count} artigo${count === 1 ? "" : "s"}` : "Filtre por seção"}
        </p>
        <button className="text-sm underline underline-offset-4" onClick={() => { setQ(""); setSection(""); setSort("recent"); }}>
          Limpar filtros
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="md:col-span-2">
          <span className="sr-only">Buscar artigos</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar artigos"
            className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            aria-describedby={liveId}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-3 md:col-span-3">
          <label>
            <span className="text-sm">Seção</span>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas</option>
              <option value="editorial">Editorial</option>
              <option value="posfacio">Posfácio</option>
              <option value="fala">Fala, ROLÊ</option>
              <option value="bpm">ROLÊ.bpm</option>
              <option value="achadinhos">Achadinhos</option>
            </select>
          </label>

          <label>
            <span className="text-sm">Ordenar por</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Filters["sort"])}
              className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="recent">Mais recentes</option>
              <option value="most_read">Mais lidos</option>
              <option value="most_saved">Mais salvos</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}