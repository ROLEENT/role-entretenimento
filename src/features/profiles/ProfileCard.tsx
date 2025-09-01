import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Verified } from "lucide-react";
import { Profile } from "./api";

export default function ProfileCard({ p }: { p: Profile }) {
  const getAvatarShape = () => {
    switch (p.type) {
      case 'artista':
        return 'rounded-full';
      case 'local':
      case 'organizador':
        return 'rounded-xl';
      default:
        return 'rounded-full';
    }
  };

  return (
    <article className="group rounded-xl overflow-hidden border bg-card hover:shadow-hover transition-all duration-300 hover-lift">
      <Link to={`/perfil/${p.handle}`} className="block">
        {/* Cover Image */}
        <div className="relative aspect-[3/1] bg-gradient-to-br from-primary/10 to-accent/5 overflow-hidden">
          {p.cover_url && (
            <img 
              src={p.cover_url} 
              alt={`Capa de ${p.name}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          
          {/* Type Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 text-xs bg-background/90 backdrop-blur-sm"
          >
            {p.type === 'artista' ? 'Artista' :
             p.type === 'local' ? 'Local' :
             p.type === 'organizador' ? 'Organizador' : p.type}
          </Badge>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className={`w-12 h-12 border-2 border-background ${getAvatarShape()}`}>
                <AvatarImage 
                  src={p.avatar_url || undefined} 
                  alt={`Avatar de ${p.name}`}
                />
                <AvatarFallback className={`bg-primary/10 text-primary font-semibold ${getAvatarShape()}`}>
                  {p.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {p.verified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Verified className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold leading-tight truncate">{p.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">@{p.handle}</p>
              
              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{p.city}, {p.state}</span>
              </div>

              {/* Tags */}
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {p.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{p.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}