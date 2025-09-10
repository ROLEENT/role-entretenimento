import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'general' | 'music' | 'art' | 'food' | 'sports' | 'technology' | 'business';
  color_hex: string;
}

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onCategoriesChange,
  label = "Categorias",
  placeholder = "Selecionar categorias...",
  className
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoriesData = categories.filter(cat => 
    selectedCategories.includes(cat.id)
  );

  const handleSelectCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      
      {/* Selected categories chips */}
      {selectedCategoriesData.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCategoriesData.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              style={{ 
                backgroundColor: `${category.color_hex}20`,
                borderColor: category.color_hex,
                color: category.color_hex
              }}
              className="flex items-center gap-1 px-2 py-1 border"
            >
              {category.name}
              <button
                type="button"
                onClick={() => handleRemoveCategory(category.id)}
                className="ml-1 hover:bg-muted/50 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Category selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCategories.length > 0
              ? `${selectedCategories.length} categoria(s) selecionada(s)`
              : placeholder}
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar categorias..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Carregando..." : "Nenhuma categoria encontrada."}
              </CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => handleSelectCategory(category.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategories.includes(category.id) 
                          ? "opacity-100" 
                          : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color_hex }}
                      />
                      <span>{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.type}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};