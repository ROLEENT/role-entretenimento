import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { X, Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistCategoriesOptions } from '@/hooks/useArtistCategoriesOptions';
import { toast } from 'sonner';

interface RHFMultiSelectCategoriesProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  maxCategories?: number;
  className?: string;
}

export const RHFMultiSelectCategories: React.FC<RHFMultiSelectCategoriesProps> = ({
  name,
  label = "Categorias",
  placeholder = "Selecione ou crie categorias",
  description,
  disabled,
  required,
  maxCategories = 3,
  className,
}) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Array<{id: string, name: string}>>([]);
  const { searchArtistCategories, createArtistCategory, loading } = useArtistCategoriesOptions();

  React.useEffect(() => {
    const loadCategories = async () => {
      const categories = await searchArtistCategories('');
      setAvailableCategories(categories.map(cat => ({
        id: cat.value,
        name: cat.label
      })));
    };
    loadCategories();
  }, [searchArtistCategories]);

  const removeCategory = (categoryId: string, fieldValue: string[], onChange: (value: string[]) => void) => {
    onChange(fieldValue.filter(id => id !== categoryId));
  };

  const addCategory = (categoryId: string, fieldValue: string[], onChange: (value: string[]) => void) => {
    if (!fieldValue.includes(categoryId) && fieldValue.length < maxCategories) {
      onChange([...fieldValue, categoryId]);
      setOpen(false);
      setSearchValue('');
    }
  };

  const handleCreateCategory = async (name: string, fieldValue: string[], onChange: (value: string[]) => void) => {
    try {
      const newCategory = await createArtistCategory(name);
      const newCategoryData = { id: newCategory.value, name: newCategory.label };
      
      // Add to available categories
      setAvailableCategories(prev => [...prev, newCategoryData]);
      
      // Add to selected categories
      addCategory(newCategory.value, fieldValue, onChange);
      
      toast.success(`Categoria "${name}" criada com sucesso!`);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = availableCategories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const filteredCategories = availableCategories.filter(category =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const hasExactMatch = filteredCategories.some(cat => 
    cat.name.toLowerCase() === searchValue.toLowerCase()
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="space-y-3">
              {/* Selected Categories */}
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {field.value.map((categoryId: string) => (
                    <Badge key={categoryId} variant="secondary" className="text-xs pr-1">
                      {getCategoryName(categoryId)}
                      {!disabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0.5 ml-1 hover:bg-destructive/20"
                          onClick={() => removeCategory(categoryId, field.value || [], field.onChange)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Category Selector */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled || (field.value && field.value.length >= maxCategories)}
                  >
                    {placeholder}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {field.value ? field.value.length : 0}/{maxCategories}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar categoria..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandEmpty>
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          {searchValue ? 'Nenhuma categoria encontrada' : 'Digite para buscar'}
                        </p>
                        {searchValue && !hasExactMatch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            disabled={loading}
                            onClick={() => handleCreateCategory(searchValue, field.value || [], field.onChange)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Criar "{searchValue}"
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          onSelect={() => addCategory(category.id, field.value || [], field.onChange)}
                          className={cn(
                            "cursor-pointer",
                            field.value?.includes(category.id) && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={field.value?.includes(category.id)}
                        >
                          {category.name}
                          {field.value?.includes(category.id) && (
                            <span className="ml-auto text-xs text-muted-foreground">Selecionado</span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </FormControl>
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};