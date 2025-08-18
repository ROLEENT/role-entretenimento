import { Button } from "./ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBanner}
          alt="Cultura e entretenimento"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-secondary/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Curadoria Independente de{" "}
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Cultura e Experiências
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            O ROLÊ é uma curadoria independente de eventos, cultura e experiências. 
            A gente vive a cena pra te mostrar o que realmente importa com estética, 
            presença e muita opinião.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 rounded-full shadow-glow transition-all duration-300 hover:scale-105"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Descubra o ROLÊ na sua cidade
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-white/20 rounded-full animate-pulse hidden lg:block" />
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-secondary/30 rounded-full animate-pulse delay-1000 hidden lg:block" />
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500 hidden lg:block" />
      </div>
    </section>
  );
};

export default HeroSection;