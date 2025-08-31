import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ArrowRight } from "lucide-react";

import { BlogPost } from "@/hooks/useBlogData";

interface ArticleCardProps {
  post: BlogPost;
  showCity?: boolean;
}

const ArticleCard = ({ post, showCity = true }: ArticleCardProps) => {
  return (
    <Card className="group hover-lift overflow-hidden">
      <div className="relative h-48">
        <img
          src={post.cover_image || "/banner-home.png"}
          alt={post.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
        {showCity && (
          <Badge variant="secondary" className="absolute top-4 left-4">
            <MapPin className="w-3 h-3 mr-1" />
            {post.city}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {post.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <span>{post.author_name || 'ROLÊ'}</span>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {post.reading_time || 5} min
            </div>
          </div>
          <span>{new Date(post.published_at || post.created_at || '').toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <Button asChild size="sm" variant="ghost" className="w-full">
          <Link to={`/destaques/${post.city}/${post.slug_data}`}>
            Ler mais
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;