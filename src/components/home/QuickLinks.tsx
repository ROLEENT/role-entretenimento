import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Wine, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuickLinkData {
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  href: string;
  count?: number;
  variant?: 'default' | 'secondary' | 'outline';
}

export function QuickLinks() {
  const [counts, setCounts] = useState({
    today: 0,
    tomorrow: 0,
    weekend: 0,
    free: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventCounts();
  }, []);

  const fetchEventCounts = async () => {
    try {
      const now = new Date();
      
      // Hoje (até 23:59)
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      // Amanhã
      const tomorrowStart = new Date(now);
      tomorrowStart.setDate(now.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);
      const tomorrowEnd = new Date(now);
      tomorrowEnd.setDate(now.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Fim de semana (sábado e domingo)
      const saturday = new Date(now);
      const daysUntilSaturday = 6 - now.getDay();
      saturday.setDate(now.getDate() + daysUntilSaturday);
      saturday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59, 999);

      // Próximos 30 dias para eventos grátis
      const nextMonth = new Date(now);
      nextMonth.setDate(now.getDate() + 30);

      const promises = [
        // Hoje
        supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('status', 'published')
          .gte('date_start', todayStart.toISOString())
          .lte('date_start', todayEnd.toISOString()),
        
        // Amanhã
        supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('status', 'published')
          .gte('date_start', tomorrowStart.toISOString())
          .lte('date_start', tomorrowEnd.toISOString()),
        
        // Fim de semana
        supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('status', 'published')
          .gte('date_start', saturday.toISOString())
          .lte('date_start', sunday.toISOString()),
        
        // Eventos grátis
        supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('status', 'published')
          .gte('date_start', now.toISOString())
          .lte('date_start', nextMonth.toISOString())
          .or('price_min.is.null,price_min.eq.0')
      ];

      const [todayRes, tomorrowRes, weekendRes, freeRes] = await Promise.all(promises);

      setCounts({
        today: todayRes.count || 0,
        tomorrow: tomorrowRes.count || 0,
        weekend: weekendRes.count || 0,
        free: freeRes.count || 0
      });
    } catch (error) {
      console.error('Erro ao buscar contadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks: QuickLinkData[] = [
    {
      icon: Clock,
      label: 'Hoje',
      description: 'O que rola agora',
      href: '/agenda?periodo=hoje',
      count: counts.today,
      variant: 'default'
    },
    {
      icon: Calendar,
      label: 'Amanhã',
      description: 'Programe-se',
      href: '/agenda?periodo=amanha',
      count: counts.tomorrow,
      variant: 'secondary'
    },
    {
      icon: Wine,
      label: 'Fim de Semana',
      description: 'Sáb e Dom',
      href: '/agenda?periodo=fimdesemana',
      count: counts.weekend,
      variant: 'outline'
    },
    {
      icon: Sparkles,
      label: 'Grátis',
      description: 'Entrada gratuita',
      href: '/agenda?preco=gratis',
      count: counts.free,
      variant: 'outline'
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Atalhos Rápidos</h2>
          <p className="text-muted-foreground">
            Acesse rapidamente os eventos que mais interessam
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            
            return (
              <Button
                key={link.label}
                asChild
                variant={link.variant}
                size="lg"
                className="h-auto p-4 flex-col gap-2 relative group"
              >
                <Link to={link.href}>
                  {/* Badge com contagem */}
                  {!loading && link.count !== undefined && link.count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-primary text-primary-foreground"
                    >
                      {link.count}
                    </Badge>
                  )}
                  
                  <Icon className="h-6 w-6 mb-1" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{link.label}</div>
                    <div className="text-xs text-muted-foreground opacity-80 group-hover:opacity-100 transition-opacity">
                      {link.description}
                    </div>
                  </div>
                  
                  {/* Loading skeleton */}
                  {loading && (
                    <div className="absolute -top-2 -right-2 w-6 h-5 bg-muted rounded animate-pulse" />
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Microcopy no tom ROLÊ */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Dica: salve os eventos que te interessam e monte sua agenda perfeita ❤️
          </p>
        </div>
      </div>
    </section>
  );
}