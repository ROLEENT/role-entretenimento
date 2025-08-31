import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SEOHelmet } from "@/components/SEOHelmet";
import { PublicLayout } from "@/components/PublicLayout";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ReadingProgress } from "@/components/revista/ReadingProgress";
import { AuthorBox } from "@/components/revista/AuthorBox";
import { ArticleNavigation } from "@/components/revista/ArticleNavigation";
import { ShareFloating } from "@/components/revista/ShareFloating";
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
      <PublicLayout>
        <div className="container mx-auto max-w-5xl px-4 md:px-6 py-8">
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !post) {
    return (
      <PublicLayout>
        <div className="container mx-auto max-w-5xl px-4 md:px-6 py-8">
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
      </PublicLayout>
    );
  }

  const publishedDate = post.published_at ? new Date(post.published_at) : new Date();
  const formattedDate = format(publishedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const currentUrl = `https://roleentretenimento.com/revista/${post.slug_data}`;

  // Generate JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    image: post.cover_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author_name || "ROLÊ"
    },
    publisher: {
      "@type": "Organization",
      name: "ROLÊ",
      logo: {
        "@type": "ImageObject",
        url: `${window.location.origin}/role-logo.png`
      }
    },
    mainEntityOfPage: currentUrl
  };

  return (
    <PublicLayout>
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
        structuredData={jsonLd}
      />

      {/* Reading Progress Bar */}
      <ReadingProgress targetId="article-content" />

      {/* Floating Share Buttons - Desktop Only */}
      <ShareFloating 
        className="hidden lg:block"
        title={post.title}
        url={currentUrl}
        description={post.summary}
      />

      <article className="relative">
        {/* Header with optimal reading width */}
        <header className="mx-auto max-w-[72ch] px-4 sm:px-6">
          {/* Breadcrumb - Mobile Visible */}
          <Breadcrumb className="mb-4 text-sm">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-muted-foreground hover:text-foreground">
                    Início
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/revista" className="text-muted-foreground hover:text-foreground">
                    Revista
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground">
                  {post.categories?.[0] || 'Artigo'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Navigation */}
          <nav className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/revista')}
              className="text-muted-foreground hover:text-foreground p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para a Revista
            </Button>
          </nav>

          {/* Article Title and Meta */}
          <div className="mb-6">
            {/* Category and Location */}
            <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{post.city}</span>
              </div>
              
              {post.categories && post.categories.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {post.categories[0]}
                </Badge>
              )}
              
              {post.featured && (
                <Badge className="text-xs bg-primary text-primary-foreground">
                  Destaque
                </Badge>
              )}
            </div>

            {/* Main Title - Optimized Typography */}
            <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {/* Lead Paragraph - Enhanced Typography */}
            <p className="mb-4 text-xl font-medium leading-8 text-muted-foreground">
              {post.summary}
            </p>

            {/* Meta Information with Share Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{post.author_name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.published_at}>{formattedDate}</time>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.reading_time} min de leitura</span>
                </div>
              </div>

              {/* Inline Share Button - Mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
                className="lg:hidden"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </header>

        {/* Cover Image - Optimal Width and Aspect Ratio */}
        {post.cover_image && (
          <figure className="mx-auto my-8 max-w-[72ch] px-4 sm:px-6">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
              <ImageWithFallback
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Caption placeholder - can be added when available in data */}
            {/* <figcaption className="mt-2 text-sm text-muted-foreground">
              Photo caption would go here
            </figcaption> */}
          </figure>
        )}

        {/* Article Content - Enhanced Typography */}
        <div id="article-content" className="mx-auto max-w-[72ch] px-4 sm:px-6">
          <div className="prose prose-lg leading-8 sm:prose-xl prose-headings:font-bold prose-headings:text-foreground prose-headings:scroll-mt-24 prose-h2:mt-10 prose-p:text-foreground prose-p:leading-7 prose-a:text-primary prose-strong:text-foreground prose-ul:my-6 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic first:prose-p:text-xl first:prose-p:font-medium first:prose-p:leading-8 max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
          </div>

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/revista?q=${encodeURIComponent(tag)}`}
                      className="inline-block"
                    >
                      <Badge 
                        variant="secondary" 
                        className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      >
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Author Box */}
          <div className="mt-8 border-t pt-8">
            <AuthorBox 
              author={{
                name: post.author_name || "ROLÊ",
                bio: "Autor da Revista ROLÊ, mergulhando em cultura, música e noite no Brasil.",
                // avatar, website, social links can be added when available in data
              }}
            />
          </div>

          {/* Article Navigation - Previous/Next */}
          <div className="mt-10">
            <ArticleNavigation 
              // previousPost and nextPost would need to be fetched from API
              // previousPost={{ title: "Previous Article", slug: "previous-slug" }}
              // nextPost={{ title: "Next Article", slug: "next-slug" }}
            />
          </div>

          {/* Mobile Share Section */}
          <div className="mt-8 pt-6 border-t lg:hidden">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(true)}
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar este artigo
              </Button>
              
              <Button
                variant="default"
                onClick={() => navigate('/revista')}
                className="w-full"
              >
                Ver mais artigos
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Share Dialog */}
      <ArticleShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        title={post.title}
        url={currentUrl}
        description={post.summary}
      />
    </PublicLayout>
  );
}