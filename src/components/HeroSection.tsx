import { Button } from "./ui/button";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";
import roleIcon from "@/assets/role-logo.png";

const HeroSection = () => {
  const { isMobile } = useResponsive();

  return (
    <section className={`relative ${isMobile ? 'py-16' : 'py-24 lg:py-32'} bg-white`}>
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className={`font-black text-black ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl lg:text-6xl'} tracking-tight leading-tight`}>
            CURADORIA INDEPENDENTE
            <br />
            DE CULTURA & EXPERIÊNCIAS
            <img 
              src={roleIcon} 
              alt="ROLÊ" 
              className={`inline-block ml-2 ${isMobile ? 'w-8 h-8' : 'w-12 h-12 md:w-16 md:h-16'}`}
            />
          </h1>
          <p className={`text-black/80 font-normal ${isMobile ? 'text-base mt-4' : 'text-lg md:text-xl mt-6'} max-w-2xl mx-auto leading-relaxed`}>
            Conectamos pessoas através de experiências culturais autênticas, 
            promovendo a diversidade e fortalecendo comunidades locais em todo o Brasil.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className={`flex ${isMobile ? 'flex-col w-full max-w-sm mx-auto' : 'flex-col sm:flex-row'} gap-4 justify-center items-center`}>
          <Button
            variant="default"
            size={isMobile ? "lg" : "lg"}
            className={`font-semibold ${isMobile ? 'w-full px-8 py-4' : 'px-8 py-4'} rounded-full transition-all duration-300 hover:scale-105 shadow-lg`}
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
            className={`font-semibold ${isMobile ? 'w-full px-8 py-4' : 'px-8 py-4'} rounded-full transition-all duration-300 hover:scale-105 shadow-lg`}
            asChild
          >
            <Link to="/destaques">
              <Star className="mr-2 h-5 w-5" />
              Destaques da Semana
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;