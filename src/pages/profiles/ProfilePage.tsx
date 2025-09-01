import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getProfileByHandle } from "@/features/profiles/api";
import FollowButton from "@/features/profiles/FollowButton";

export default function ProfilePage() {
  const { handle = "" } = useParams();
  const clean = handle.replace(/^@/,"").toLowerCase();
  const [p, setP] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try { const prof = await getProfileByHandle(clean); if (alive) setP(prof); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [clean]);

  if (loading) return <main className="mx-auto max-w-6xl px-4 md:px-6 py-10"><div className="h-48 rounded-3xl border animate-pulse" /></main>;
  if (!p) return <main className="mx-auto max-w-6xl px-4 md:px-6 py-10">Perfil não encontrado</main>;

  return (
    <main className="mx-auto max-w-6xl px-0 md:px-0 pb-10">
      <Helmet>
        <title>{p.name} - @{p.handle}</title>
        <meta name="description" content={p.bio_short ?? `Perfil de ${p.name}`} />
        {p.cover_url ? <meta property="og:image" content={p.cover_url} /> : null}
        <link rel="canonical" href={`/perfil/${p.handle}`} />
      </Helmet>

      {/* Header */}
      <section className="relative">
        <div className="h-56 md:h-64 bg-gray-200 overflow-hidden">
          {p.cover_url ? <img src={p.cover_url} alt={`Capa de ${p.name}`} className="w-full h-full object-cover" /> : null}
        </div>
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="-mt-10 md:-mt-12 flex items-end gap-4">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {p.avatar_url ? <img src={p.avatar_url} alt={`Avatar de ${p.name}`} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex-1 grid">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{p.name}</h1>
              <p className="text-sm text-gray-600">@{p.handle} • {p.city}</p>
            </div>
            <FollowButton profileId={p.id} />
          </div>
        </div>
      </section>

      {/* Abas simples - por enquanto só Visão geral */}
      <div className="mx-auto max-w-6xl px-4 md:px-6 grid gap-6 mt-6">
        <nav className="flex gap-3 text-sm border-b pb-2">
          <a className="font-semibold">Visão geral</a>
          <a className="text-gray-600" href="#sobre">Sobre</a>
        </nav>

        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Sobre</h2>
          <p id="sobre" className="text-sm text-gray-700">{p.bio || p.bio_short || "Sem descrição"}</p>
        </section>
      </div>
    </main>
  );
}