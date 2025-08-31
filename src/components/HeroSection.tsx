import React from "react";
import { Button } from "./ui/button";
import { ArrowRight, MapPin, BookOpen } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";

// Memoized HeroSection to prevent unnecessary re-renders
const HeroSection = React.memo(() => {
  const { isMobile } = useResponsive();

  // Memoize static content to avoid recreation
  const title = React.useMemo(() => (
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-foreground mb-6">
      <span className="block">CURADORIA</span>
      <span className="block">INDEPENDENTE</span>
      <span className="block">DE CULTURA &</span>
      <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        experiências
      </span>
    </h1>
  ), []);

  const tagline = React.useMemo(() => (
    <p className="text-[15px] sm:text-base text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
      Conectamos pessoas através de experiências culturais autênticas.
      <span className="block mt-1 font-medium text-foreground">
        Diversidade, afeto e comunidade em todo o Brasil.
      </span>
    </p>
  ), []);

  return (
    <section className="relative py-16 sm:py-20">
      <div className="container mx-auto px-4 text-center">
        {title}
        {tagline}

        {/* CTAs - Mobile: empilhados (full width), Desktop: lado a lado */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            asChild
          >
            <Link to="/agenda">
              <MapPin className="mr-2 h-5 w-5" />
              Descubra o ROLÊ
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base font-semibold border-2 hover:bg-accent transition-all duration-200"
            asChild
          >
            <Link to="/revista">
              <BookOpen className="mr-2 h-5 w-5" />
              Revista
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;