import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SEOHelmet } from "@/components/SEOHelmet";
import { PageWrapper } from "@/components/PageWrapper";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getRevistaPostBySlug, RevistaPost } from "@/hooks/useRevistaData";
import { incrementPostViews } from "@/hooks/useBlogData";
import { ArticleShareDialog } from "@/components/revista/ArticleShareDialog";
import { ArrowLeft, Calendar, Clock, MapPin, Share2, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RevistaArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<RevistaPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setError("Slug do artigo não encontrado");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const postData = await getRevistaPostBySlug(slug);
        
        if (!postData) {
          setError("Artigo não encontrado");
          setIsLoading(false);
          return;
        }

        setPost(postData);
        
        // Increment view count
        await incrementPostViews(postData.id);
      } catch (err: any) {
        console.error("Error loading post:", err);
        setError(err.message || "Erro ao carregar artigo");
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !post) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              {error || "Artigo não encontrado"}
            </h1>
            <Button onClick={() => navigate('/revista')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a Revista
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const publishedDate = post.published_at ? new Date(post.published_at) : new Date();
  const formattedDate = format(publishedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const currentUrl = `https://roleentretenimento.com/revista/${post.slug_data}`;

  return (
    <>
      <SEOHelmet
        title={post.seo_title || `${post.title} | Revista ROLÊ`}
        description={post.seo_description || post.summary}
        image={post.cover_image}
        url={currentUrl}
        type="article"
        publishedTime={post.published_at || undefined}
        modifiedTime={post.updated_at}
        author={post.author_name}
        tags={post.tags}
      />

      <PageWrapper>
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/revista')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a Revista
            </Button>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{post.city}</span>
                </div>
                
                {post.categories && post.categories.length > 0 && (
                  <Badge variant="outline">
                    {post.categories[0].name}
                  </Badge>
                )}
                
                {post.featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Destaque
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                {post.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {post.summary}
              </p>
            </div>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{post.author_name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.reading_time} min de leitura</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </header>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="mb-8">
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/revista')}
                >
                  Ver mais artigos
                </Button>
              </div>
            </div>
          </footer>
        </article>

        {/* Share Dialog */}
        <ArticleShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          title={post.title}
          url={currentUrl}
          description={post.summary}
        />
      </PageWrapper>
    </>
  );
}