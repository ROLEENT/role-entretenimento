import { Button } from "./ui/button";
import { ArrowRight, MapPin, BookOpen } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";
import roleIcon from "@/assets/role-logo.png";

const HeroSection = () => {
  const { isMobile } = useResponsive();

  return (
    <section className={`hero-section ${isMobile ? 'py-10' : 'py-14'}`}>
      <div className="hero-container">
        {/* Título Principal */}
        <h1 className="hero-title">
          <span className="hero-title-line">CURADORIA</span>
          <span className="hero-title-line">INDEPENDENTE</span>
          <span className="hero-title-line">DE CULTURA &</span>
          <span className="hero-title-line hero-highlight">experiências</span>
        </h1>
        
        {/* Tagline */}
        <p className="hero-tagline">
          Conectamos pessoas através de experiências culturais autênticas.
          <span className="hero-tagline-emphasis">
            Diversidade, afeto e comunidade em todo o Brasil.
          </span>
        </p>

        {/* Botões CTA */}
        <div className="hero-cta">
          <Button
            className="hero-btn-primary"
            asChild
          >
            <Link to="/agenda">
              <MapPin className="mr-3 h-5 w-5" />
              {isMobile ? 'Descubra o ROLÊ' : 'Descubra o ROLÊ na sua cidade'}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="hero-btn-secondary"
            asChild
          >
            <Link to="/agenda">
              <BookOpen className="mr-3 h-5 w-5" />
              Editoriais
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;