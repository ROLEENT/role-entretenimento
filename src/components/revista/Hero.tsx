import { Link } from "react-router-dom";
import { RevistaPost } from "@/hooks/useRevistaData";

interface HeroProps {
  mainPost: RevistaPost;
  sideePosts: RevistaPost[];
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
    month: "short" 
  });
}

export function Hero({ mainPost, sideePosts }: HeroProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-3" aria-labelledby="hero-heading">
      <div className="sr-only" id="hero-heading">Destaques da revista</div>
      
      {/* Main featured article */}
      <Link 
        to={`/revista/${mainPost.slug}`} 
        className="group rounded-3xl overflow-hidden border lg:col-span-2 bg-card hover:shadow-lg transition-all duration-300"
      >
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img 
            src={mainPost.cover_url} 
            alt={mainPost.title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" 
          />
        </div>
        <div className="p-6 grid gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full border bg-primary/10 text-primary font-medium">
              {labelSection(mainPost.tags?.[0])}
            </span>
            {mainPost.reading_time_min && (
              <span>{mainPost.reading_time_min} min de leitura</span>
            )}
            <time dateTime={mainPost.published_at}>
              {formatDate(mainPost.published_at)}
            </time>
          </div>
          <h2 className="text-2xl font-bold leading-tight line-clamp-2">
            {mainPost.title}
          </h2>
          <p className="text-muted-foreground line-clamp-3">
            {mainPost.excerpt}
          </p>
          {mainPost.author_name && (
            <span className="text-sm font-medium">Por {mainPost.author_name}</span>
          )}
        </div>
      </Link>

      {/* Side articles */}
      <div className="grid gap-6">
        {sideePosts.slice(0, 2).map((post) => (
          <Link 
            key={post.id}
            to={`/revista/${post.slug}`} 
            className="rounded-3xl overflow-hidden border bg-card hover:shadow-md transition-all duration-300"
          >
            <div className="aspect-video overflow-hidden">
              <img 
                src={post.cover_url} 
                alt={post.title}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="p-4 grid gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full border bg-primary/10 text-primary font-medium">
                  {labelSection(post.tags?.[0])}
                </span>
                {post.reading_time_min && (
                  <span>{post.reading_time_min} min</span>
                )}
              </div>
              <h3 className="font-semibold leading-snug line-clamp-2">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}