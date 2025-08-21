import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Marina Silva",
      role: "Produtora Musical",
      avatar: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
      rating: 5,
      text: "O ROLÊ revolucionou a forma como divulgo meus eventos. Consegui aumentar 300% a presença do público!"
    },
    {
      name: "Carlos Rodrigues",
      role: "DJ e Organizador",
      avatar: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
      rating: 5,
      text: "Plataforma incrível! Facilita muito encontrar os eventos que realmente me interessam na cidade."
    },
    {
      name: "Ana Costa",
      role: "Frequentadora Assídua",
      avatar: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
      rating: 5,
      text: "Nunca mais perdi um evento legal! O ROLÊ sempre me mantém atualizada com o que rola na noite."
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            O que dizem sobre o ROLÊ
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Depoimentos reais de quem usa nossa plataforma para descobrir e divulgar eventos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary mb-4 opacity-20" />
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;