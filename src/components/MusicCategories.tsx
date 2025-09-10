import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Zap, Guitar, Headphones, Mic, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MusicCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapear ícones para as categorias
  const iconMap: { [key: string]: any } = {
    Volume2, Headphones, Guitar, Mic, Music, Zap
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('music_categories')
        .select('*')
        .order('created_at');

      if (error) throw error;

      // Buscar contagem real de eventos por categoria
      const categoriesWithCounts = await Promise.all(
        data?.map(async (category) => {
          const { count } = await supabase
            .from('event_categories')
            .select('*', { count: 'exact' })
            .eq('category_id', category.id);

          return {
            ...category,
            icon: iconMap[category.icon] || Music,
            eventCount: count || 0,
            description: getCategoryDescription(category.slug),
            bgColor: getBgColor(category.color_hex),
            color: getGradientColor(category.color_hex)
          };
        }) || []
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDescription = (slug: string) => {
    const descriptions: { [key: string]: string } = {
      'funk': 'Bailes, pancadões e os melhores DJs do funk nacional',
      'eletronica': 'House, techno, trance e muito mais',
      'rock': 'Rock nacional, internacional e underground',
      'hip-hop': 'Rap, trap e cultura hip hop',
      'sertanejo': 'Universitário, raiz e os grandes sucessos',
      'pop': 'Os maiores hits do pop nacional e internacional'
    };
    return descriptions[slug] || 'Descubra eventos incríveis desta categoria';
  };

  const getBgColor = (colorHex: string) => {
    const colorMap: { [key: string]: string } = {
      '#EC4899': 'bg-secondary/20',
      '#3B82F6': 'bg-primary/20',
      '#EF4444': 'bg-destructive/20',
      '#F59E0B': 'bg-accent/20',
      '#10B981': 'bg-muted/20',
      '#8B5CF6': 'bg-primary/20'
    };
    return colorMap[colorHex] || 'bg-muted/20';
  };

  const getGradientColor = (colorHex: string) => {
    const gradientMap: { [key: string]: string } = {
      '#EC4899': 'from-secondary to-primary',
      '#3B82F6': 'from-primary to-accent',
      '#EF4444': 'from-destructive to-primary',
      '#F59E0B': 'from-accent to-secondary',
      '#10B981': 'from-muted to-secondary',
      '#8B5CF6': 'from-primary to-secondary'
    };
    return gradientMap[colorHex] || 'from-muted to-secondary';
  };

  const handleCategoryClick = (categorySlug: string) => {
    // Navegar para página de eventos com filtro de categoria
    navigate(`/eventos?cats=${categorySlug}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Categorias Musicais
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Encontre eventos do seu estilo musical favorito
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Categorias Musicais
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre eventos do seu estilo musical favorito
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 ${category.bgColor} border-0`}
                onClick={() => handleCategoryClick(category.slug)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {category.eventCount} eventos
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                        {category.description}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-primary font-medium group-hover:gap-3 transition-all duration-300">
                        <span>Explorar categoria</span>
                        <svg 
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Music className="w-5 h-5" />
            <span>Mais de <strong className="text-primary">180 eventos</strong> em todas as categorias</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MusicCategories;