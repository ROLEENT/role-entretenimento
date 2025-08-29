import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useResponsive } from "@/hooks/useResponsive";

const RoleEmNumeros = () => {
  const { isMobile } = useResponsive();
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const [metrics, setMetrics] = useState({
    reach_thousands: 550,
    views_millions: 2.0,
    active_cities: 5,
    followers_thousands: 24
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentMetrics();
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
          reach_thousands: data.reach_thousands || 550,
          views_millions: data.views_millions || 2.0,
          active_cities: data.active_cities || 5,
          followers_thousands: data.followers_thousands || 24
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
      metrics.views_millions * 10,
      metrics.active_cities,
      metrics.followers_thousands
    ];

    const duration = 2500;
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
      emoji: "👥",
      number: `${counters[0]}+`,
      label: "Pessoas alcançadas",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      emoji: "👁",
      number: `${(counters[1] / 10).toFixed(1)}M`,
      label: "Visualizações",
      gradient: "from-green-500 to-teal-600"
    },
    {
      emoji: "🌆",
      number: counters[2],
      label: "Cidades",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      emoji: "⭐",
      number: `${counters[3]}k`,
      label: "Seguidores",
      gradient: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <section className={`${isMobile ? 'py-16' : 'py-24'} bg-gradient-to-br from-muted/30 to-background relative overflow-hidden`}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`font-heading font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-6`}>
            ROLÊ EM NÚMEROS
          </h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-xl'} max-w-2xl mx-auto`}>
            Métricas que mostram o alcance e impacto da nossa curadoria
          </p>
        </div>
        
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-8' : 'grid-cols-4 gap-12'} max-w-6xl mx-auto`}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center group animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              {/* Large Emoji Icon */}
              <div className={`w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl hover:shadow-2xl`}>
                <span className="text-4xl">{stat.emoji}</span>
              </div>
              
              {/* Large Number */}
              <div className={`font-heading font-black text-foreground ${isMobile ? 'text-4xl' : 'text-5xl md:text-6xl lg:text-7xl'} mb-3 group-hover:text-primary transition-all duration-300 leading-none`}>
                {stat.number}
              </div>
              
              {/* Clear Label */}
              <p className={`text-muted-foreground font-semibold ${isMobile ? 'text-sm' : 'text-base lg:text-lg'} tracking-wide leading-tight`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleEmNumeros;