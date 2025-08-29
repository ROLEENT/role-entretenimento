import { Button } from "./ui/button";
import { ArrowRight, MapPin, BookOpen } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";
import roleIcon from "@/assets/role-logo.png";

const HeroSection = () => {
  const { isMobile } = useResponsive();

  return (
    <section className={`relative ${isMobile ? 'py-16' : 'py-24 lg:py-32'} bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
        {/* Main Title - Editorial Typography */}
        <div className="mb-6">
          <h1 
            className="font-serif font-bold text-foreground tracking-tighter leading-[1.1] mb-3 animate-fade-in"
            style={{ fontSize: 'clamp(28px, 6vw, 56px)' }}
          >
            <span className="block font-black">CURADORIA</span>
            <span className="block font-black">INDEPENDENTE</span>
            <span className="block font-black">DE CULTURA &</span>
            <span className="block font-black" style={{ color: '#c77dff' }}>EXPERIÊNCIAS</span>
          </h1>
          
          {/* Tagline - Centered with max width */}
          <div className="max-w-[720px] mx-auto mb-8">
            <p 
              className="font-medium leading-relaxed animate-fade-in text-center" 
              style={{ 
                animationDelay: '0.3s',
                color: '#9ca3af',
                fontSize: '18px'
              }}
            >
              Conectamos pessoas através de experiências culturais autênticas. 
              <span className="block mt-1">
                <span className="font-semibold" style={{ color: '#c77dff' }}>Diversidade, afeto e comunidade</span> em todo o Brasil.
              </span>
            </p>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-row justify-center gap-6 items-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button
            variant="default"
            size="lg"
            className={`font-semibold ${isMobile ? 'w-full px-8 py-7 text-lg' : 'px-12 py-7 text-lg'} rounded-full transition-all duration-300 hover:scale-105 hover:shadow-glow group bg-primary hover:bg-primary/90 border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
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
            className={`font-semibold ${isMobile ? 'w-full px-8 py-7 text-lg' : 'px-12 py-7 text-lg'} rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-primary text-primary hover:bg-primary/10 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
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