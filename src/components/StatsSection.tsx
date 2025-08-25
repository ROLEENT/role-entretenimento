import { useEffect, useState } from "react";
import { Users, Eye, MapPin, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsSection = () => {
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const [metrics, setMetrics] = useState({
    reach_thousands: 850,
    views_millions: 2.3,
    active_cities: 6,
    followers_thousands: 120
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentMetrics();
    
    // Realtime updates para métricas
    const channel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'site_metrics',
          filter: 'is_current=eq.true'
        },
        () => {
          loadCurrentMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCurrentMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('site_metrics')
        .select('*')
        .eq('is_current', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setMetrics({
          reach_thousands: data.reach_thousands || 850,
          views_millions: data.views_millions || 2.3,
          active_cities: data.active_cities || 6,
          followers_thousands: data.followers_thousands || 120
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    const targets = [
      metrics.reach_thousands,
      metrics.views_millions * 100, // Para animação mais suave
      metrics.active_cities,
      metrics.followers_thousands
    ];

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      
      setCounters(targets.map(target => 
        Math.floor(target * progress)
      ));
      
      if (progress >= 1) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [loading, metrics]);

  const stats = [
    {
      icon: Users,
      number: counters[0],
      label: "mil pessoas alcançadas",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      icon: Eye,
      number: (counters[1] / 100).toFixed(1),
      label: "milhões de visualizações",
      color: "text-green-600", 
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      icon: MapPin,
      number: counters[2],
      label: "cidades ativas",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      icon: Heart,
      number: counters[3],
      label: "mil seguidores",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ROLÊ em números
            </h2>
            <p className="text-muted-foreground text-lg">
              Carregando estatísticas...
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ROLÊ em números
          </h2>
          <p className="text-muted-foreground text-lg">
            Nossa comunidade crescendo a cada dia
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {stat.number}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;