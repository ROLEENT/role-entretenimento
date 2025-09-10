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
import { useGenresOptions } from '@/hooks/useGenresOptions';
import { toast } from 'sonner';

interface RHFMultiSelectGenresProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  maxGenres?: number;
  className?: string;
}

export const RHFMultiSelectGenres: React.FC<RHFMultiSelectGenresProps> = ({
  name,
  label = "Gêneros",
  placeholder = "Selecione ou crie gêneros",
  description,
  disabled,
  required,
  maxGenres = 5,
  className,
}) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [availableGenres, setAvailableGenres] = useState<Array<{id: string, name: string}>>([]);
  const { searchGenres, createGenre, loading } = useGenresOptions();

  React.useEffect(() => {
    const loadGenres = async () => {
      const genres = await searchGenres('');
      setAvailableGenres(genres.map(genre => ({
        id: genre.value,
        name: genre.label
      })));
    };
    loadGenres();
  }, [searchGenres]);

  const removeGenre = (genreId: string, fieldValue: string[], onChange: (value: string[]) => void) => {
    onChange(fieldValue.filter(id => id !== genreId));
  };

  const addGenre = (genreId: string, fieldValue: string[], onChange: (value: string[]) => void) => {
    if (!fieldValue.includes(genreId) && fieldValue.length < maxGenres) {
      onChange([...fieldValue, genreId]);
      setOpen(false);
      setSearchValue('');
    }
  };

  const handleCreateGenre = async (name: string, fieldValue: string[], onChange: (value: string[]) => void) => {
    try {
      const newGenre = await createGenre(name);
      const newGenreData = { id: newGenre.value, name: newGenre.label };
      
      // Add to available genres
      setAvailableGenres(prev => [...prev, newGenreData]);
      
      // Add to selected genres
      addGenre(newGenre.value, fieldValue, onChange);
      
      toast.success(`Gênero "${name}" criado com sucesso!`);
    } catch (error) {
      console.error('Error creating genre:', error);
      toast.error('Erro ao criar gênero');
    }
  };

  const getGenreName = (genreId: string) => {
    const genre = availableGenres.find(g => g.id === genreId);
    return genre?.name || genreId;
  };

  const filteredGenres = availableGenres.filter(genre =>
    genre.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const hasExactMatch = filteredGenres.some(genre => 
    genre.name.toLowerCase() === searchValue.toLowerCase()
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
              {/* Selected Genres */}
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {field.value.map((genreId: string) => (
                    <Badge key={genreId} variant="secondary" className="text-xs pr-1">
                      {getGenreName(genreId)}
                      {!disabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0.5 ml-1 hover:bg-destructive/20"
                          onClick={() => removeGenre(genreId, field.value || [], field.onChange)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Genre Selector */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled || (field.value && field.value.length >= maxGenres)}
                  >
                    {placeholder}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {field.value ? field.value.length : 0}/{maxGenres}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar gênero..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandEmpty>
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          {searchValue ? 'Nenhum gênero encontrado' : 'Digite para buscar'}
                        </p>
                        {searchValue && !hasExactMatch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            disabled={loading}
                            onClick={() => handleCreateGenre(searchValue, field.value || [], field.onChange)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Criar "{searchValue}"
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredGenres.map((genre) => (
                        <CommandItem
                          key={genre.id}
                          onSelect={() => addGenre(genre.id, field.value || [], field.onChange)}
                          className={cn(
                            "cursor-pointer",
                            field.value?.includes(genre.id) && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={field.value?.includes(genre.id)}
                        >
                          {genre.name}
                          {field.value?.includes(genre.id) && (
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