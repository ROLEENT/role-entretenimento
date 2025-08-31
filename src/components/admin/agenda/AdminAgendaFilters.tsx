import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Badge } from '@/components/ui/badge';
import { X, RotateCcw } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface AdminAgendaFiltersProps {
  filters: {
    search: string;
    status: string;
    city: string;
    dateRange: { from: Date | null; to: Date | null };
    tags: string[];
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export function AdminAgendaFilters({ filters, onFiltersChange, onReset }: AdminAgendaFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleCityChange = (value: string) => {
    onFiltersChange({ ...filters, city: value });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: { 
        from: range?.from || null, 
        to: range?.to || null 
      } 
    });
  };

  const handleTagRemove = (tagToRemove: string) => {
    onFiltersChange({ 
      ...filters, 
      tags: filters.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.city || 
    filters.dateRange.from || filters.dateRange.to || filters.tags.length > 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Buscar</label>
          <Input
            placeholder="Digite o título, cidade ou tag..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium mb-2 block">Cidade</label>
            <Select value={filters.city} onValueChange={handleCityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as cidades</SelectItem>
                <SelectItem value="sao-paulo">São Paulo</SelectItem>
                <SelectItem value="rio-de-janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="brasilia">Brasília</SelectItem>
                <SelectItem value="belo-horizonte">Belo Horizonte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Período do Evento</label>
            <DatePickerWithRange
              date={{ from: filters.dateRange.from, to: filters.dateRange.to }}
              onDateChange={handleDateRangeChange}
            />
          </div>
        </div>

        {/* Active Tags */}
        {filters.tags.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Tags Selecionadas</label>
            <div className="flex flex-wrap gap-2">
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}