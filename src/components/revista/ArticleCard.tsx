import { Link } from "react-router-dom";
import { Clock, User } from "lucide-react";
import { RevistaPost } from "@/hooks/useRevistaData";

interface ArticleCardProps {
  post: RevistaPost;
  className?: string;
}

function labelSection(section: string) {
  switch (section?.toLowerCase()) {
    case 'editorial': return 'Editorial';
    case 'posfacio': return 'Posfácio';
    case 'fala': return 'Fala, ROLÊ';
    case 'bpm': return 'ROLÊ.bpm';
    case 'achadinhos': return 'Achadinhos';
    default: return section || 'Editorial';
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", { 
    day: "2-digit", 
    month: "short",
    year: "numeric"
  });
}

export function ArticleCard({ post, className = "" }: ArticleCardProps) {
  const handleClick = () => {
    // Telemetria
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click_card', {
        article_id: post.id,
        article_title: post.title,
        article_section: post.tags?.[0] || 'unknown',
        source: 'revista_grid'
      });
    }
  };

  return (
    <article className={`group rounded-2xl overflow-hidden border bg-card hover:shadow-md transition-all duration-300 ${className}`}>
      <Link 
        to={`/revista/${post.slug}`} 
        className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl"
        onClick={handleClick}
      >
        {/* Imagem de capa */}
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={post.cover_url}
            alt={post.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-3">
          {/* Meta informações */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {/* Seção */}
            <span className="px-2 py-1 rounded-full border bg-primary/10 text-primary font-medium">
              {labelSection(post.tags?.[0])}
            </span>
            
            {/* Featured badge */}
            {post.featured && (
              <span className="px-2 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                Destaque
              </span>
            )}
            
            {/* Tempo de leitura */}
            {post.reading_time_min && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.reading_time_min} min
              </span>
            )}
            
            {/* Data */}
            <time dateTime={post.published_at}>
              {formatDate(post.published_at)}
            </time>
          </div>

          {/* Título */}
          <h3 className="text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Resumo */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>

          {/* Autor */}
          {post.author_name && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              <User className="w-3 h-3" />
              <span>Por {post.author_name}</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}