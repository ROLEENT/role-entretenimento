import { Button } from "./ui/button";
import { ArrowRight, MapPin, BookOpen } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";
import roleIcon from "@/assets/role-logo.png";

const HeroSection = () => {
  const { isMobile } = useResponsive();

  return (
    <section className={`relative ${isMobile ? 'py-20' : 'py-32 lg:py-40'} bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Main Title */}
        <div className="mb-12">
          <h1 className={`font-heading font-black text-foreground ${isMobile ? 'text-4xl' : 'text-5xl md:text-6xl lg:text-7xl'} tracking-tight leading-[0.9] mb-6`}>
            <span className="block">CURADORIA INDEPENDENTE</span>
            <span className="block">DE CULTURA &</span>
            <span className="block gradient-text">EXPERIÊNCIAS</span>
            <img 
              src={roleIcon} 
              alt="ROLÊ" 
              className={`inline-block ml-4 ${isMobile ? 'w-12 h-12' : 'w-16 h-16 md:w-20 md:h-20'} hover:animate-bounce-subtle`}
            />
          </h1>
          <p className={`text-muted-foreground font-medium ${isMobile ? 'text-lg mt-6' : 'text-xl md:text-2xl mt-8'} max-w-4xl mx-auto leading-relaxed`}>
            Conectamos pessoas através de experiências culturais autênticas.
            <br className="hidden md:block" />
            <span className="text-primary font-semibold">Diversidade, afeto e comunidade</span> em todo o Brasil.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className={`flex ${isMobile ? 'flex-col w-full max-w-sm mx-auto' : 'flex-row justify-center'} gap-6 items-center`}>
          <Button
            variant="default"
            size="lg"
            className={`font-semibold ${isMobile ? 'w-full px-8 py-6 text-lg' : 'px-10 py-6 text-lg'} rounded-full transition-all duration-300 hover:scale-105 hover:shadow-glow group`}
            asChild
          >
            <Link to="/eventos">
              <MapPin className="mr-3 h-6 w-6 group-hover:animate-bounce-subtle" />
              {isMobile ? 'Descubra o ROLÊ' : 'Descubra o ROLÊ na sua cidade'}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className={`font-semibold ${isMobile ? 'w-full px-8 py-6 text-lg' : 'px-10 py-6 text-lg'} rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 group`}
            asChild
          >
            <Link to="/destaques">
              <BookOpen className="mr-3 h-6 w-6 group-hover:animate-bounce-subtle" />
              Editoriais
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;