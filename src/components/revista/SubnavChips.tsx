import { Link, useLocation } from "react-router-dom";

const sections = [
  { key: "", label: "Todos" },
  { key: "editorial", label: "Editorial" },
  { key: "posfacio", label: "Posfácio" },
  { key: "fala", label: "Fala, ROLÊ" },
  { key: "bpm", label: "ROLÊ.bpm" },
  { key: "achadinhos", label: "Achadinhos" },
];

interface SubnavChipsProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

export function SubnavChips({ currentSection = "", onSectionChange }: SubnavChipsProps) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const createHref = (sectionKey: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sectionKey) {
      newParams.set("secao", sectionKey);
    } else {
      newParams.delete("secao");
    }
    return `${location.pathname}?${newParams.toString()}`;
  };

  const handleClick = (sectionKey: string) => {
    onSectionChange?.(sectionKey);
    
    // Telemetria
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click_chip_secao', {
        section: sectionKey || 'todos',
        source: 'revista_subnav'
      });
    }
  };

  return (
    <nav aria-label="Seções da revista" className="flex flex-wrap gap-2">
      {sections.map((section) => {
        const isActive = currentSection === section.key;
        return (
          <Link
            key={section.key}
            to={createHref(section.key)}
            onClick={() => handleClick(section.key)}
            aria-current={isActive ? "page" : undefined}
            className={`
              px-4 py-2 rounded-full border text-sm font-medium transition-colors
              ${isActive 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-background hover:bg-accent hover:text-accent-foreground border-border"
              }
            `}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}