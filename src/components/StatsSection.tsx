import { useEffect, useState } from "react";
import { Users, Eye, MapPin, Heart } from "lucide-react";

const StatsSection = () => {
  const [counters, setCounters] = useState({
    reach: 0,
    views: 0,
    cities: 0,
    followers: 0,
  });

  const finalStats = {
    reach: 500,
    views: 2,
    cities: 5,
    followers: 22,
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const intervals = 50; // Number of steps
    const stepTime = duration / intervals;

    const timer = setInterval(() => {
      setCounters(prev => ({
        reach: Math.min(prev.reach + Math.ceil(finalStats.reach / intervals), finalStats.reach),
        views: Math.min(prev.views + Math.ceil(finalStats.views / intervals), finalStats.views),
        cities: Math.min(prev.cities + Math.ceil(finalStats.cities / intervals), finalStats.cities),
        followers: Math.min(prev.followers + Math.ceil(finalStats.followers / intervals), finalStats.followers),
      }));
    }, stepTime);

    // Clear interval when animation is complete
    const timeout = setTimeout(() => {
      clearInterval(timer);
      setCounters(finalStats);
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  const stats = [
    {
      icon: Users,
      number: counters.reach,
      label: "Mil contas alcançadas",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Eye,
      number: counters.views,
      label: "Milhões de views mensais",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: MapPin,
      number: counters.cities,
      label: "Cidades ativas",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Heart,
      number: counters.followers,
      label: "Mil seguidores",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <section className="py-16 bg-background" aria-labelledby="stats-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="stats-title" className="text-3xl font-bold text-foreground mb-4">
            ROLÊ em números
          </h2>
          <p className="text-lg text-muted-foreground">
            O impacto da nossa comunidade na cena cultural brasileira
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="space-y-2">
                  <div className={`text-4xl font-bold ${stat.color}`} aria-live="polite">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;