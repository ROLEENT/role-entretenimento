import { Button } from "./ui/button";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <section className={`relative ${isMobile ? 'mobile-hero-section' : 'min-h-screen'} flex flex-col items-center justify-center overflow-hidden hero-gradient`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 hero-pattern opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Main Title */}
        <div className="mb-8 animate-fade-in">
          <h1 className={`font-bold text-white mb-4 ${isMobile ? 'mobile-hero-title' : 'text-4xl md:text-6xl lg:text-7xl'} tracking-tight`}>
            CURADORIA
            <br />
            <span className="text-primary-glow">INDEPENDENTE</span>
          </h1>
          <p className={`text-white/90 font-medium ${isMobile ? 'mobile-hero-subtitle' : 'text-lg md:text-xl lg:text-2xl'} max-w-3xl mx-auto leading-relaxed`}>
            Descubra a melhor cultura e entretenimento do Brasil
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className={`flex ${isMobile ? 'flex-col w-full max-w-sm mx-auto' : 'flex-col sm:flex-row'} gap-4 justify-center items-center animate-scale-in`} style={{ animationDelay: '0.4s' }}>
          <Button
            variant="secondary"
            size={isMobile ? "lg" : "lg"}
            className={`font-semibold ${isMobile ? 'w-full px-8 py-4' : 'px-8 py-4'} rounded-full bg-white/95 text-gray-900 hover:bg-white transition-all duration-300 hover:scale-105 shadow-xl backdrop-blur-sm touch-target`}
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
            size={isMobile ? "lg" : "lg"}
            className={`font-semibold ${isMobile ? 'w-full px-8 py-4' : 'px-8 py-4'} rounded-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-xl touch-target`}
            asChild
          >
            <Link to="/destaques">
              <Star className="mr-2 h-5 w-5" />
              Destaques da Semana
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default HeroSection;