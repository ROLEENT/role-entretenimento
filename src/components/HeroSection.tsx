import { Button } from "./ui/button";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";
import { ImageFallback } from "./ui/image-fallback";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  const parallaxRef = useParallax(0.3);
  const { isMobile, isTablet } = useResponsive();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax and Overlay */}
      <div 
        ref={parallaxRef}
        className="absolute inset-0 z-0 parallax-bg scale-105"
      >
        <ImageFallback
          src={`/lovable-uploads/1b1881aa-51f5-49c3-83e7-14f6c7d06137.png?v=${Date.now()}`}
          alt="Curadoria independente de cultura e experiências"
          className="w-full h-full object-cover object-center md:object-center"
          fallback={heroBanner}
          showIcon={false}
        />
        
      </div>

      {/* Content - Buttons positioned at bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-col sm:flex-row'} gap-4 justify-center items-center animate-scale-in`} style={{ animationDelay: '0.4s' }}>
            <Button
              variant="secondary"
              size={isMobile ? "default" : "lg"}
              className={`font-semibold ${isMobile ? 'w-full max-w-sm px-6 py-3' : 'px-8 py-4'} rounded-full bg-white/90 text-gray-900 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm touch-target`}
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
              className={`font-semibold ${isMobile ? 'w-full max-w-sm px-6 py-3' : 'px-8 py-4'} rounded-full bg-black/20 backdrop-blur-sm border-white/30 text-white hover:bg-black/30 transition-all duration-300 hover:scale-105 shadow-lg touch-target`}
              asChild
            >
              <Link to="/destaques">
                <Star className="mr-2 h-5 w-5" />
                Destaques da Semana
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;