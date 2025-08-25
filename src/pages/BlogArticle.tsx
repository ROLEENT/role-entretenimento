import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug, getCityPosts } from "@/hooks/useBlogData";
import ArticleHero from "@/components/blog/ArticleHero";
import ArticleContent from "@/components/blog/ArticleContent";
import ShareButtons from "@/components/blog/ShareButtons";
import ArticleNavigation from "@/components/blog/ArticleNavigation";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import BlogBreadcrumbs from "@/components/blog/BlogBreadcrumbs";
import CommentSection from "@/components/blog/CommentSection";
import LikeButton from "@/components/blog/LikeButton";
import { useCommentNotifications } from '@/hooks/useCommentNotifications';

const BlogArticle = () => {
  const { cidade, data } = useParams();
  const [post, setPost] = useState<any>(null);
  const [previousPost, setPreviousPost] = useState<any>(null);
  const [nextPost, setNextPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enable comment notifications for this post
  useCommentNotifications(post?.id, 'blog');

  useEffect(() => {
    const loadPost = async () => {
      if (cidade && data) {
        setIsLoading(true);
        
        try {
          const foundPost = await getPostBySlug(cidade, data);
          setPost(foundPost);
          
          if (foundPost) {
            // Update page title and meta
            document.title = `${foundPost.title} | ROLÊ`;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
              metaDescription.setAttribute('content', foundPost.summary || foundPost.content_html?.substring(0, 160));
            }
            
            // Get navigation posts
            const cityPosts = await getCityPosts(cidade);
            const sortedPosts = cityPosts.sort((a, b) => 
              new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime()
            );
            
            const currentIndex = sortedPosts.findIndex(p => p.id === foundPost.id);
            setPreviousPost(currentIndex > 0 ? sortedPosts[currentIndex - 1] : null);
            setNextPost(currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null);
          }
        } catch (error) {
          console.error("Error loading post:", error);
          setPost(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPost();
  }, [cidade, data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-96 w-full mb-8" />
            <div className="max-w-4xl mx-auto space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O artigo solicitado não foi encontrado ou pode ter sido movido.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to={`/destaques/${cidade}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para {cidade}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/destaques">
                Todos os Destaques
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-6">
          <BlogBreadcrumbs 
            items={[
              { label: "Início", href: "/" },
              { label: "Destaques", href: "/destaques" },
              { label: post.city, href: `/destaques/${cidade}` },
              { label: post.title, isCurrentPage: true }
            ]}
          />
        </div>

        {/* Article Hero */}
        <ArticleHero post={post} />

        {/* Article Content */}
        <ScrollAnimationWrapper>
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <ArticleContent content={post.content_html || post.content} />
                
                {/* Article Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-border">
                  <LikeButton postId={post.id} />
                  <ShareButtons 
                    title={post.title} 
                    url={currentUrl} 
                  />
                </div>
                
                {/* Comments Section */}
                <CommentSection postId={post.id} />
                
                {/* Article Navigation */}
                <ArticleNavigation previousPost={previousPost} nextPost={nextPost} />
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>
      </main>
      
      <Footer />
      <BackToTop />
      <Toaster />
    </div>
  );
};

export default BlogArticle;