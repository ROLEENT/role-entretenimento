import { useResponsive } from "@/hooks/useResponsive";

const HeroSection = () => {
  const { isMobile } = useResponsive();

  return (
    <section className={`relative ${isMobile ? 'py-16' : 'py-24 lg:py-32'} bg-white`}>
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main Title */}
        <div className="mb-6">
          <h1 className={`font-black text-black ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl lg:text-6xl'} tracking-tight leading-tight`}>
            CURADORIA INDEPENDENTE
            <br />
            DE CULTURA & EXPERIÊNCIAS
            <span className="inline-block ml-2 text-primary font-bold">ROLÊ</span>
          </h1>
          <p className={`text-black/80 font-normal ${isMobile ? 'text-base mt-4' : 'text-lg md:text-xl mt-6'} max-w-2xl mx-auto leading-relaxed`}>
            Conectamos pessoas através de experiências culturais autênticas, 
            promovendo a diversidade e fortalecendo comunidades locais em todo o Brasil.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;