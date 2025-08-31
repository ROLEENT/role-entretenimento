import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Calendar, MapPin, Clock, FileText } from "lucide-react";
import { RevistaPost } from "@/hooks/useRevistaData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RevistaCardProps {
  post: RevistaPost;
}

export function RevistaCard({ post }: RevistaCardProps) {
  const publishedDate = post.published_at ? new Date(post.published_at) : new Date();
  const timeAgo = formatDistanceToNow(publishedDate, { 
    addSuffix: true, 
    locale: ptBR 
  });

  // Determine section from available data
  const section = post.categories?.[0]?.name || 'Cultura';

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      <Link 
        to={`/revista/${post.slug_data || post.slug}`} 
        className="block h-full focus:outline-none"
        aria-label={`Ler artigo: ${post.title}`}
      >
        {/* Image section */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {post.cover_image ? (
            <ImageWithFallback
              src={post.cover_image}
              alt={`Imagem ilustrativa do artigo "${post.title}"`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <FileText className="w-12 h-12 text-muted-foreground/40" aria-hidden="true" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {post.featured && (
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0">
                <span className="sr-only">Artigo em</span>
                Destaque
              </Badge>
            )}
          </div>
        </div>
        
        {/* Content section */}
        <CardContent className="p-5 flex flex-col h-full min-h-[200px]">
          {/* Meta info */}
          <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {section}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg leading-tight mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[3.5rem] flex items-start">
            {post.title}
          </h3>

          {/* Summary */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
            {post.summary || post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{timeAgo}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.reading_time || post.reading_time_min || 5} min</span>
              </div>
            </div>

            {post.author_name && (
              <span className="font-medium text-foreground/80 truncate max-w-[100px]">
                {post.author_name}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}