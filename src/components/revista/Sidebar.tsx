import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Mail, TrendingUp, BookOpen, Send } from "lucide-react";
import { RevistaPost } from "@/hooks/useRevistaData";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [mostRead, setMostRead] = useState<RevistaPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");

  useEffect(() => {
    fetchMostRead();
    fetchTrendingTopics();
  }, []);

  const fetchMostRead = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(5);

      if (data) {
        const transformedPosts: RevistaPost[] = data.map(item => ({
          id: item.id,
          title: item.title,
          excerpt: item.summary,
          summary: item.summary,
          cover_url: item.cover_image,
          cover_image: item.cover_image,
          publish_at: item.published_at,
          published_at: item.published_at,
          reading_time_min: item.reading_time || 5,
          reading_time: item.reading_time || 5,
          city: item.city,
          slug: item.slug,
          author_name: item.author_name,
          tags: item.tags || [],
          featured: item.featured || false,
        }));
        setMostRead(transformedPosts);
      }
    } catch (error) {
      console.error('Erro ao buscar mais lidos:', error);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published')
        .not('tags', 'is', null);

      if (data) {
        const allTags = data.flatMap(post => post.tags || []);
        const tagCounts = allTags.reduce((acc: Record<string, number>, tag) => {
          if (tag && typeof tag === 'string') {
            acc[tag] = (acc[tag] || 0) + 1;
          }
          return acc;
        }, {});

        const trending = Object.entries(tagCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 8)
          .map(([tag]) => tag);

        setTrendingTopics(trending);
      }
    } catch (error) {
      console.error('Erro ao buscar tópicos em alta:', error);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscriptionMessage("");

    try {
      // Aqui você implementaria a lógica de newsletter
      // Por enquanto, apenas simulamos o sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscriptionMessage("Obrigado! Você foi inscrito na nossa newsletter.");
      setEmail("");
      
      // Telemetria
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'signup_newsletter', {
          source: 'revista_sidebar'
        });
      }
    } catch (error) {
      setSubscriptionMessage("Erro ao se inscrever. Tente novamente.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <aside className={`space-y-8 ${className}`} aria-label="Conteúdo relacionado">
      {/* Mais lidos da semana */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="w-5 h-5 text-primary" />
          Mais lidos da semana
        </h2>
        <div className="space-y-3">
          {mostRead.map((post, index) => (
            <Link
              key={post.id}
              to={`/revista/${post.slug}`}
              className="flex gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors group"
            >
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-full">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {post.reading_time_min} min de leitura
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tópicos em alta */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="w-5 h-5 text-primary" />
          Tópicos em alta
        </h2>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <Link
              key={topic}
              to={`/revista?q=${encodeURIComponent(topic)}`}
              className="px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              #{topic}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="space-y-4 p-4 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Mail className="w-5 h-5 text-primary" />
          Newsletter ROLÊ
        </h2>
        <p className="text-sm text-muted-foreground">
          Receba os melhores artigos sobre cultura e música direto no seu email.
        </p>
        
        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor email"
            required
            className="w-full h-10 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isSubscribing}
            className="w-full h-10 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSubscribing ? "Inscrevendo..." : "Quero receber"}
          </button>
        </form>
        
        {subscriptionMessage && (
          <p className={`text-xs ${subscriptionMessage.includes('Erro') ? 'text-destructive' : 'text-green-600'}`}>
            {subscriptionMessage}
          </p>
        )}
      </section>

      {/* CTA Envie sua pauta */}
      <section className="p-4 rounded-xl border bg-gradient-to-br from-accent/50 to-accent/30">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
          <Send className="w-5 h-5 text-primary" />
          Envie sua pauta
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tem uma história interessante sobre cultura ou música? Compartilhe conosco!
        </p>
        <Link
          to="/contato"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Enviar pauta
        </Link>
      </section>
    </aside>
  );
}