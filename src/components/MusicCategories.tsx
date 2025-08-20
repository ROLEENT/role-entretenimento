import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Zap, Guitar, Headphones, Mic, Volume2 } from "lucide-react";

const MusicCategories = () => {
  const categories = [
    {
      id: 1,
      name: "Funk",
      description: "Bailes, pancadões e os melhores DJs do funk nacional",
      icon: Volume2,
      eventCount: 45,
      color: "from-pink-500 to-purple-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/20"
    },
    {
      id: 2,
      name: "Eletrônica",
      description: "House, techno, trance e muito mais",
      icon: Headphones,
      eventCount: 38,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      id: 3,
      name: "Rock",
      description: "Rock nacional, internacional e underground",
      icon: Guitar,
      eventCount: 29,
      color: "from-red-500 to-orange-600",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
    {
      id: 4,
      name: "Hip Hop",
      description: "Rap, trap e cultura hip hop",
      icon: Mic,
      eventCount: 22,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
    },
    {
      id: 5,
      name: "Sertanejo",
      description: "Universitário, raiz e os grandes sucessos",
      icon: Music,
      eventCount: 31,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      id: 6,
      name: "Pop",
      description: "Os maiores hits do pop nacional e internacional",
      icon: Zap,
      eventCount: 26,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50 dark:bg-violet-950/20"
    }
  ];

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