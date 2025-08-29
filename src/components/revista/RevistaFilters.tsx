import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { getRevistaCities, getRevistaSections } from "@/hooks/useRevistaData";

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
  const [sections, setSections] = useState<string[]>([]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      const [citiesData, sectionsData] = await Promise.all([
        getRevistaCities(),
        getRevistaSections()
      ]);
      
      setCities(citiesData);
      setSections(sectionsData);
    };

    loadFilterOptions();
  }, []);

  const hasActiveFilters = searchTerm || cityFilter || sectionFilter;

  return (
    <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar artigos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={cityFilter} onValueChange={onCityChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as cidades</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="capitalize">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sectionFilter} onValueChange={onSectionChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Seção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as seções</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={onClearFilters}
              title="Limpar filtros"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filtros ativos:</span>
          
          {searchTerm && (
            <span className="bg-muted px-2 py-1 rounded text-xs">
              "{searchTerm}"
            </span>
          )}
          
          {cityFilter && (
            <span className="bg-muted px-2 py-1 rounded text-xs capitalize">
              {cityFilter}
            </span>
          )}
          
          {sectionFilter && (
            <span className="bg-muted px-2 py-1 rounded text-xs">
              {sectionFilter}
            </span>
          )}
        </div>
      )}
    </div>
  );
}