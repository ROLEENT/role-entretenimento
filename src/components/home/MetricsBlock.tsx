import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Metrics {
  reach_thousands: number;
  views_millions: number;
  active_cities: number;
  followers_thousands: number;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(n);
}

export default function MetricsBlock() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from("site_metrics")
          .select("reach_thousands, views_millions, active_cities, followers_thousands")
          .eq("is_current", true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar métricas:', error);
          return;
        }

        if (data) {
          setMetrics(data);
        }
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="h-8 bg-muted rounded mb-6 w-64 mx-auto animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4 text-center bg-card animate-pulse">
              <div className="h-8 w-8 bg-muted rounded mx-auto mb-1" />
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!metrics) {
    return null;
  }

  const items = [
    { 
      label: "Pessoas alcançadas", 
      value: formatNumber(metrics.reach_thousands * 1000), 
      icon: "👥" 
    },
    { 
      label: "Visualizações", 
      value: formatNumber(metrics.views_millions * 1000000), 
      icon: "👁️" 
    },
    { 
      label: "Cidades", 
      value: formatNumber(metrics.active_cities), 
      icon: "🗺️" 
    },
    { 
      label: "Seguidores", 
      value: formatNumber(metrics.followers_thousands * 1000), 
      icon: "⭐" 
    },
  ];

  return (
    <section className="py-12">
      <h2 className="text-center text-2xl font-bold mb-6 text-foreground">ROLÊ em números</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border p-4 text-center bg-card hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1" aria-hidden="true">{item.icon}</div>
            <div className="text-3xl font-extrabold leading-none text-foreground">{item.value}</div>
            <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}