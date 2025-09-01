import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationPost {
  title: string;
  slug: string;
  slug_data?: string;
}

interface ArticleNavigationProps {
  previousPost?: NavigationPost;
  nextPost?: NavigationPost;
  className?: string;
}

export function ArticleNavigation({ previousPost, nextPost, className = "" }: ArticleNavigationProps) {
  if (!previousPost && !nextPost) return null;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Previous Post */}
      <div className={`${!previousPost ? 'md:col-start-2' : ''}`}>
        {previousPost ? (
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Link 
                to={`/revista/${previousPost.slug_data || previousPost.slug}`}
                className="group block"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Artigo anterior</span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {previousPost.title}
                </h3>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div />
        )}
      </div>

      {/* Next Post */}
      <div>
        {nextPost && (
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Link 
                to={`/revista/${nextPost.slug_data || nextPost.slug}`}
                className="group block"
              >
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                  <span>Próximo artigo</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-right">
                  {nextPost.title}
                </h3>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}