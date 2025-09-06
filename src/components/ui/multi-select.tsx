import { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: MultiSelectOption[];
  onSelectionChange: (selected: MultiSelectOption[]) => void;
  onCreateNew?: (name: string) => Promise<string>; // Returns the new ID
  placeholder?: string;
  searchPlaceholder?: string;
  maxSelections?: number;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  onCreateNew,
  placeholder = "Selecionar itens...",
  searchPlaceholder = "Buscar ou criar...",
  maxSelections = 8,
  className,
  disabled = false,
  loading = false,
  emptyText = "Nenhum item encontrado",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search and exclude already selected
  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(searchValue.toLowerCase()) &&
    !selected.some(s => s.id === option.id)
  );

  // Check if search term could be used to create a new item
  const canCreateNew = onCreateNew && 
    searchValue.trim() && 
    !filteredOptions.some(option => option.name.toLowerCase() === searchValue.toLowerCase()) &&
    selected.length < maxSelections;

  const handleSelect = (option: MultiSelectOption) => {
    if (selected.length >= maxSelections) return;
    
    const newSelected = [...selected, option];
    onSelectionChange(newSelected);
    setSearchValue('');
  };

  const handleRemove = (optionId: string) => {
    const newSelected = selected.filter(item => item.id !== optionId);
    onSelectionChange(newSelected);
  };

  const handleCreateNew = async () => {
    if (!onCreateNew || !searchValue.trim() || isCreating) return;
    
    setIsCreating(true);
    try {
      const newId = await onCreateNew(searchValue.trim());
      const newOption = { id: newId, name: searchValue.trim() };
      handleSelect(newOption);
    } catch (error) {
      console.error('Error creating new item:', error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const isMaxReached = selected.length >= maxSelections;

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-h-[40px] h-auto p-2",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selected.map((item) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="h-6 text-xs"
                  >
                    {item.name}
                    <button
                      type="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(item.id);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleRemove(item.id)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              disabled={loading}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Carregando..." : emptyText}
              </CommandEmpty>
              
              {canCreateNew && (
                <CommandGroup>
                  <CommandItem onSelect={handleCreateNew} disabled={isCreating}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? "Criando..." : `Criar "${searchValue}"`}
                  </CommandItem>
                </CommandGroup>
              )}
              
              {filteredOptions.length > 0 && (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.id}
                      onSelect={() => handleSelect(option)}
                      disabled={isMaxReached}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.some(s => s.id === option.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
          
          {isMaxReached && (
            <div className="px-2 py-1 text-xs text-muted-foreground border-t">
              Máximo de {maxSelections} itens selecionados
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}