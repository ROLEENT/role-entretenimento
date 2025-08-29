import { useEffect, useState } from "react";
import { Users, Eye, MapPin, Heart } from "lucide-react";
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
      icon: Users,
      number: `${counters[0]}+`,
      label: "pessoas alcançadas",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Eye,
      number: `${(counters[1] / 10).toFixed(1)}M`,
      label: "visualizações",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: MapPin,
      number: counters[2],
      label: "cidades ativas",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Heart,
      number: `${counters[3]}k`,
      label: "seguidores",
      gradient: "from-red-500 to-rose-600"
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
            4 métricas com ícones grandes e tipografia de impacto
          </p>
        </div>
        
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-8' : 'grid-cols-4 gap-12'} max-w-6xl mx-auto`}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg hover:shadow-xl`}>
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                <div className={`font-heading font-black text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-2 group-hover:text-primary transition-colors`}>
                  {stat.number}
                </div>
                <p className={`text-muted-foreground font-medium ${isMobile ? 'text-sm' : 'text-base'} uppercase tracking-wide`}>
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

export default RoleEmNumeros;