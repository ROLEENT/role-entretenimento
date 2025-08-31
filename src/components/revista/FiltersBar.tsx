import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface FiltersBarProps {
  searchTerm: string;
  sectionFilter: string;
  sortBy: string;
  onSearchChange: (term: string) => void;
  onSectionChange: (section: string) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
  totalCount?: number;
  className?: string;
}

const sections = [
  { value: "", label: "Todas as seções" },
  { value: "editorial", label: "Editorial" },
  { value: "posfacio", label: "Posfácio" },
  { value: "fala", label: "Fala, ROLÊ" },
  { value: "bpm", label: "ROLÊ.bpm" },
  { value: "achadinhos", label: "Achadinhos" },
];

const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "most_read", label: "Mais lidos" },
  { value: "most_saved", label: "Mais salvos" },
];

export function FiltersBar({
  searchTerm,
  sectionFilter,
  sortBy,
  onSearchChange,
  onSectionChange,
  onSortChange,
  onClearFilters,
  totalCount,
  className = ""
}: FiltersBarProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange(value);
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    onClearFilters();
    
    // Telemetria
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'clear_filters', {
        source: 'revista_filters'
      });
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'section') {
      onSectionChange(value);
    } else if (type === 'sort') {
      onSortChange(value);
    }
    
    // Telemetria
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'apply_filter', {
        filter_type: type,
        filter_value: value,
        source: 'revista_filters'
      });
    }
  };

  const hasActiveFilters = searchTerm || sectionFilter || sortBy !== 'recent';

  return (
    <div className={`bg-background/80 backdrop-blur-sm border rounded-2xl p-4 md:p-6 space-y-4 ${className}`}>
      {/* Header com contador e limpar filtros */}
      <div className="flex items-center justify-between">
        <div 
          className="text-sm text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {typeof totalCount === 'number' ? (
            `${totalCount} artigo${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`
          ) : (
            'Filtre os artigos da revista'
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Busca */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar artigos por título..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            aria-label="Buscar artigos"
          />
        </div>

        {/* Select de Seção */}
        <div className="space-y-1">
          <label htmlFor="section-select" className="block text-xs font-medium text-muted-foreground">
            Seção
          </label>
          <select
            id="section-select"
            value={sectionFilter}
            onChange={(e) => handleFilterChange('section', e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            {sections.map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </select>
        </div>

        {/* Select de Ordenação */}
        <div className="space-y-1 md:col-start-3">
          <label htmlFor="sort-select" className="block text-xs font-medium text-muted-foreground">
            Ordenar por
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Busca: "{searchTerm}"
            </span>
          )}
          {sectionFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Seção: {sections.find(s => s.value === sectionFilter)?.label}
            </span>
          )}
          {sortBy !== 'recent' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Ordem: {sortOptions.find(s => s.value === sortBy)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}