import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { BookOpen, Calendar } from "lucide-react";

const MagazineBanner = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto overflow-hidden cursor-pointer hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              {/* Content */}
              <div className="flex-1 p-8">
                <div className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  EDITORIAL SEMANAL
                </div>
                
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Revista ROLÊ
                </h3>
                
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Editorial semanal com as melhores histórias, entrevistas e conteúdos da cena cultural brasileira.
                </p>
                
                <Button size="lg" className="group">
                  <BookOpen className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                  Ler Revista
                </Button>
              </div>
              
              {/* Visual Element */}
              <div className="md:w-80 p-8 flex justify-center">
                <div className="relative">
                  <div className="w-48 h-64 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg shadow-lg flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-primary/60" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📖</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MagazineBanner;