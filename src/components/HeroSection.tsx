import { Button } from "./ui/button";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  const parallaxRef = useParallax(0.3);
  const { isMobile, isTablet } = useResponsive();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax and Overlay */}
      <div 
        ref={parallaxRef}
        className="absolute inset-0 z-0 parallax-bg scale-110"
      >
        <img
          src={heroBanner}
          alt="Cultura e entretenimento"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
      </div>

      {/* Content */}
      <div className={`relative z-10 container mx-auto ${isMobile ? 'px-4' : 'px-4'} text-center animate-fade-in`}>
        <div className="max-w-4xl mx-auto">
          <h1 className={`${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl md:text-7xl'} font-bold text-white mb-6 leading-tight`}>
            Curadoria Independente de{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-glow">
              Cultura e Experiências
            </span>
          </h1>
          
          <p className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
            O ROLÊ é uma curadoria independente de eventos, cultura e experiências. 
            A gente vive a cena pra te mostrar o que realmente importa com estética, 
            presença e muita opinião.
          </p>

          <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-col sm:flex-row'} gap-4 justify-center items-center animate-scale-in`} style={{ animationDelay: '0.4s' }}>
            <Button
              variant="gradient"
              size={isMobile ? "default" : "lg"}
              className={`font-semibold ${isMobile ? 'w-full max-w-sm px-6 py-3' : 'px-8 py-4'} rounded-full shadow-glow transition-all duration-300 hover:scale-105 hover-lift touch-target`}
              asChild
            >
              <Link to="/eventos">
                <MapPin className="mr-2 h-5 w-5" />
                {isMobile ? 'Descubra o ROLÊ' : 'Descubra o ROLÊ na sua cidade'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size={isMobile ? "default" : "lg"}
              className={`font-semibold ${isMobile ? 'w-full max-w-sm px-6 py-3' : 'px-8 py-4'} rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 touch-target`}
              asChild
            >
              <Link to="/destaques">
                <Star className="mr-2 h-5 w-5" />
                Destaques da Semana
              </Link>
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