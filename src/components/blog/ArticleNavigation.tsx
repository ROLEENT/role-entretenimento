import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlogPost } from "@/data/blogData";

interface ArticleNavigationProps {
  previousPost?: BlogPost;
  nextPost?: BlogPost;
}

const ArticleNavigation = ({ previousPost, nextPost }: ArticleNavigationProps) => {
  if (!previousPost && !nextPost) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
      {previousPost && (
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <ChevronLeft className="w-4 h-4" />
              <span>Artigo anterior</span>
            </div>
            <Link 
              to={`/destaques/${previousPost.citySlug}/${previousPost.slug}`}
              className="block"
            >
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {previousPost.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {previousPost.weekRange} • {previousPost.city}
              </p>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {nextPost && (
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-right">
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-3">
              <span>Próximo artigo</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <Link 
              to={`/destaques/${nextPost.citySlug}/${nextPost.slug}`}
              className="block"
            >
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {nextPost.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {nextPost.weekRange} • {nextPost.city}
              </p>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArticleNavigation;