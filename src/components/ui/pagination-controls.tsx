import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFirst: () => void;
  onLast: () => void;
  onNext: () => void;
  onPrevious: () => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  hasNext,
  hasPrevious,
  onPageChange,
  onPageSizeChange,
  onFirst,
  onLast,
  onNext,
  onPrevious,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  className = ""
}) => {
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      onPageChange(value);
    }
  };

  if (totalItems === 0) {
    return (
      <div className={`flex items-center justify-center text-muted-foreground ${className}`}>
        Nenhum item encontrado
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Items info */}
      <div className="text-sm text-muted-foreground">
        Mostrando {startIndex + 1}-{endIndex} de {totalItems} itens
      </div>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
               <SelectContent position="popper" className="z-[100]">
                 {pageSizeOptions.map(size => (
                   <SelectItem key={size} value={size.toString()}>
                     {size}
                   </SelectItem>
                 ))}
               </SelectContent>
            </Select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFirst}
            disabled={!hasPrevious}
            className="gap-1"
          >
            <ChevronsLeft className="w-4 h-4" />
            Primeira
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Página</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handlePageInputChange}
              className="w-16 h-8 text-center text-sm border border-border rounded px-1"
            />
            <span className="text-sm text-muted-foreground">de {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLast}
            disabled={!hasNext}
            className="gap-1"
          >
            Última
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};