import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RevistaFiltersProps {
  searchTerm: string;
  cityFilter: string;
  sectionFilter: string;
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onClearFilters: () => void;
}

export function RevistaFilters({
  searchTerm,
  cityFilter,
  sectionFilter,
  onSearchChange,
  onCityChange,
  onSectionChange,
  onClearFilters
}: RevistaFiltersProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [sections] = useState<string[]>(['editorial', 'cultura', 'música', 'arte']);

  useEffect(() => {
    const loadCities = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('city')
        .eq('status', 'published');
        
      const citiesData = Array.from(new Set((data || []).map(item => item.city).filter(Boolean)));
      setCities(citiesData);
    };

    loadCities();
  }, []);

  const hasActiveFilters = searchTerm || cityFilter || sectionFilter;

  return (
    <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-6 space-y-4">
      {/* Search - full width on all screens */}
      <div className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar artigos"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 text-base"
            aria-label="Buscar artigos na revista"
            aria-controls="revista-articles-list"
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            Use esta busca para filtrar artigos por título. Os resultados aparecerão automaticamente conforme você digita.
          </div>
        </div>
      </div>

      {/* Filters - responsive layout */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={cityFilter} onValueChange={onCityChange}>
            <SelectTrigger 
              className="w-full h-11" 
              aria-label="Filtrar artigos por cidade"
              aria-describedby="city-filter-help"
            >
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-[100]">
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="capitalize cursor-pointer">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="city-filter-help" className="sr-only">
            Filtrar artigos por cidade específica
          </div>
        </div>

        <div className="flex-1">
          <Select value={sectionFilter} onValueChange={onSectionChange}>
            <SelectTrigger 
              className="w-full h-11" 
              aria-label="Filtrar artigos por seção"
              aria-describedby="section-filter-help"
            >
              <SelectValue placeholder="Seção" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-[100]">
              {sections.map((section) => (
                <SelectItem key={section} value={section} className="capitalize cursor-pointer">
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="section-filter-help" className="sr-only">
            Filtrar artigos por categoria ou seção
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-center sm:justify-start">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onClearFilters}
              className="h-11 w-11 shrink-0"
              title="Limpar filtros"
              aria-label="Limpar todos os filtros"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
          <Filter className="w-4 h-4" />
          <span>Filtros ativos:</span>
          
          {searchTerm && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
              "{searchTerm}"
            </span>
          )}
          
          {cityFilter && (
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium capitalize">
              {cityFilter}
            </span>
          )}
          
          {sectionFilter && (
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium capitalize">
              {sectionFilter}
            </span>
          )}
        </div>
      )}
    </div>
  );
}