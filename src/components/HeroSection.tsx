import { Button } from "./ui/button";
import { ArrowRight, MapPin, BookOpen } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";
import roleIcon from "@/assets/role-logo.png";

const HeroSection = () => {
  const { isMobile } = useResponsive();

  return (
    <section className={`relative ${isMobile ? 'py-24' : 'py-40 lg:py-48'} bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
        {/* Main Title - Editorial Typography */}
        <div className={`${isMobile ? 'mb-16' : 'mb-20'}`}>
          <h1 className={`font-serif font-bold text-foreground ${isMobile ? 'text-5xl' : 'text-6xl md:text-7xl lg:text-8xl xl:text-9xl'} tracking-tighter leading-[0.85] ${isMobile ? 'mb-8' : 'mb-12'} animate-fade-in`}>
            <span className="block font-black">CURADORIA</span>
            <span className="block font-black">INDEPENDENTE</span>
            <span className="block font-black">DE CULTURA &</span>
            <span className="block gradient-text font-black">EXPERIÊNCIAS</span>
          </h1>
          
          {/* Tagline - Centered with max width */}
          <div className="max-w-3xl mx-auto">
            <p className={`text-muted-foreground font-medium ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} leading-relaxed animate-fade-in`} style={{ animationDelay: '0.3s' }}>
              Conectamos pessoas através de experiências culturais autênticas. 
              <span className="block mt-2">
                <span className="text-primary font-semibold">Diversidade, afeto e comunidade</span> em todo o Brasil.
              </span>
            </p>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className={`flex ${isMobile ? 'flex-col w-full max-w-sm mx-auto' : 'flex-row justify-center'} gap-6 items-center animate-fade-in`} style={{ animationDelay: '0.6s' }}>
          <Button
            variant="default"
            size="lg"
            className={`font-semibold ${isMobile ? 'w-full px-8 py-7 text-lg' : 'px-12 py-7 text-lg'} rounded-full transition-all duration-300 hover:scale-105 hover:shadow-glow group bg-primary hover:bg-primary/90 border-0`}
            asChild
          >
            <Link to="/agenda">
              <MapPin className="mr-3 h-6 w-6 group-hover:animate-bounce-subtle" />
              {isMobile ? 'Descubra o ROLÊ' : 'Descubra o ROLÊ na sua cidade'}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className={`font-semibold ${isMobile ? 'w-full px-8 py-7 text-lg' : 'px-12 py-7 text-lg'} rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-primary text-primary hover:bg-primary/10 group`}
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