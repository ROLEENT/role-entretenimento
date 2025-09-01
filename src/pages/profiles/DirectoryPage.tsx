import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ProfileCard from "@/features/profiles/ProfileCard";
import { listProfiles, ProfileType } from "@/features/profiles/api";

export default function DirectoryPage() {
  const [searchParams] = useSearchParams();
  const cityFromUrl = searchParams.get('city') || '';
  
  const [q, setQ] = useState("");
  const [type, setType] = useState<ProfileType | "">("");
  const [city, setCity] = useState(cityFromUrl);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fKey = useMemo(() => `${q}|${type}|${city}|${offset}`, [q, type, city, offset]);

  // Update city when URL parameter changes
  useEffect(() => {
    setCity(cityFromUrl);
  }, [cityFromUrl]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data, total } = await listProfiles({ q, type: type || undefined, city: city || undefined, limit: 24, offset });
        if (!alive) return;
        setItems(data);
        setTotal(total);
      } finally { if (alive) setLoading(false); }
    }, 200);
    return () => { alive = false; clearTimeout(t); };
  }, [fKey]);

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-10 grid gap-6">
      <Helmet><title>Perfis</title></Helmet>
      <header className="grid gap-2">
        <h1 className="text-3xl font-bold">Perfis</h1>
        <p className="text-gray-600">Artistas, locais e organizadores</p>
      </header>

      <section className="rounded-3xl border p-4 grid gap-3">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="h-10 rounded-md border px-3 text-sm" placeholder="Buscar por nome" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="h-10 rounded-md border px-3 text-sm" value={type} onChange={(e)=>setType(e.target.value as any)}>
            <option value="">Todos os tipos</option>
            <option value="artista">Artistas</option>
            <option value="local">Locais</option>
            <option value="organizador">Organizadores</option>
          </select>
          <input className="h-10 rounded-md border px-3 text-sm" placeholder="Cidade" value={city} onChange={(e)=>setCity(e.target.value)} />
        </div>
        <div className="text-sm text-gray-600">{total} resultado{total===1?"":"s"}</div>
      </section>

      {loading && !items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length:9}).map((_,i)=>(<div key={i} className="h-48 rounded-2xl border animate-pulse" />))}</div>
      ) : items.length ? (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(p => <ProfileCard key={p.id} p={p} />)}
          </section>
          <div className="flex justify-center py-6">
            <button disabled={loading || items.length>=total} onClick={()=>setOffset(o=>o+24)} className="px-4 py-2 rounded-md border">Carregar mais</button>
          </div>
        </>
      ) : (
        <div className="text-center py-16">Nenhum perfil encontrado</div>
      )}
    </main>
  );
}