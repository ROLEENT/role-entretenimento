import { Profile } from "./api";

export default function ProfileCard({ p }: { p: Profile }) {
  return (
    <article className="rounded-2xl overflow-hidden border bg-white hover:shadow-md transition">
      <a href={`/perfil/${p.handle}`} className="block">
        <div className="aspect-[3/1] bg-gray-100 overflow-hidden">
          {p.cover_url ? <img src={p.cover_url} alt={`Capa de ${p.name}`} className="w-full h-full object-cover" /> : null}
        </div>
        <div className="p-4 flex gap-3 items-center">
          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {p.avatar_url ? <img src={p.avatar_url} alt={`Avatar de ${p.name}`} className="w-full h-full object-cover" /> : null}
          </div>
          <div className="grid">
            <h3 className="font-semibold leading-tight">{p.name}</h3>
            <p className="text-xs text-gray-600">@{p.handle} • {p.city}</p>
          </div>
        </div>
      </a>
    </article>
  );
}