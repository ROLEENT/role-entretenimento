import { Link } from "react-router-dom";
import { Profile } from "./api";
import { FollowButton } from "@/components/profiles/FollowButton";

export default function ProfileCard({ p }: { p: Profile }) {
  return (
    <article className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300">
      <Link to={`/perfil/${p.handle}`} className="block">
        <div className="relative aspect-[3/1] bg-muted overflow-hidden">
          {p.cover_url ? (
            <img 
              src={p.cover_url} 
              alt={`Capa de ${p.name}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              loading="lazy"
            />
          ) : null}
          <span className="absolute left-3 top-3 text-xs px-2 py-1 rounded-full bg-black/70 text-white capitalize">
            {p.type}
            {p.category_name && (
              <span className="opacity-80"> • {p.category_name}</span>
            )}
          </span>
        </div>
      </Link>

      <div className="p-4 flex items-center gap-3">
        <Link to={`/perfil/${p.handle}`} className="shrink-0 h-12 w-12 rounded-full overflow-hidden bg-muted border">
          {p.avatar_url ? (
            <img 
              src={p.avatar_url} 
              alt={`Avatar de ${p.name}`} 
              className="h-full w-full object-cover" 
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center text-sm font-semibold">
              {p.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        
        <div className="grid flex-1 min-w-0">
          <Link to={`/perfil/${p.handle}`} className="font-semibold leading-tight group-hover:underline truncate">
            {p.name} {p.verified ? <span title="Verificado">✔️</span> : null}
          </Link>
          <p className="text-xs text-muted-foreground truncate">@{p.handle} • {p.city}</p>
        </div>
        
        <FollowButton profileId={p.id} size="sm" />
      </div>
    </article>
  );
}