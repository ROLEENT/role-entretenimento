import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Calendar, MapPin, Clock } from "lucide-react";
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

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={`/revista/${post.slug_data}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <ImageWithFallback
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              Destaque
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="capitalize">{post.city}</span>
            </div>
            
            {post.categories && post.categories.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {post.categories[0].name}
              </Badge>
            )}
          </div>

          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-3">
            {post.summary}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{timeAgo}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{post.reading_time} min</span>
              </div>
            </div>

            <span className="font-medium">{post.author_name}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}