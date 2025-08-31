import * as React from "react";
import { useFormContext, useController } from "react-hook-form";
import { ChevronsUpDown, Check, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import {
  Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type Item = { id: string | number; label: string };

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  table: string;
  valueColumn?: string;      // default: "id"
  labelColumn?: string;      // default: "name"
  searchColumn?: string;     // default: labelColumn
  where?: Record<string, string | number | boolean | null>;
  multiple?: boolean;
  onCreateClick?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export function RHFRemoteCombobox({
  name,
  label,
  placeholder = "Selecione...",
  description,
  table,
  valueColumn = "id",
  labelColumn = "name", 
  searchColumn,
  where,
  multiple = false,
  onCreateClick,
  disabled = false,
  required = false,
  className,
}: Props) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const { value, onChange } = field;
  const { error } = fieldState;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);

  const effectiveSearch = searchColumn ?? labelColumn;

  // Buscar dados com paginação
  const fetchPage = React.useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const from = (currentPage - 1) * 20;
      const to = from + 19;

      let q = supabase.from(table)
        .select(`${valueColumn}, ${labelColumn}`, { count: "exact" })
        .range(from, to)
        .order(labelColumn);

      // Aplicar filtro de busca
      if (query.trim()) {
        q = q.ilike(effectiveSearch, `%${query.trim()}%`);
      }

      // Aplicar filtros where
      if (where) {
        Object.entries(where).forEach(([k, v]) => {
          if (v === null) q = q.is(k, null);
          else q = q.eq(k, v as any);
        });
      }

      const { data, error, count } = await q;
      
      if (error) {
        console.error(`[RHFRemoteCombobox] Error fetching from ${table}:`, error);
        return;
      }

      const mapped: Item[] = (data ?? []).map((r: any) => ({
        id: r[valueColumn],
        label: r[labelColumn]
      }));

      if (reset) {
        setItems(mapped);
        setPage(1);
      } else {
        // Evitar duplicatas ao concatenar
        setItems(prev => {
          const existing = new Set(prev.map(item => String(item.id)));
          const newItems = mapped.filter(item => !existing.has(String(item.id)));
          return [...prev, ...newItems];
        });
      }

      setTotalCount(count ?? 0);
      setHasMore(count ? (reset ? count > 20 : count > (currentPage * 20)) : false);
      
    } catch (err) {
      console.error(`[RHFRemoteCombobox] Unexpected error:`, err);
    } finally {
      setLoading(false);
    }
  }, [table, valueColumn, labelColumn, effectiveSearch, where, query, page, loading]);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPage(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, where, table]); // Removido fetchPage das dependências para evitar loop

  // Carregar dados quando abrir
  React.useEffect(() => {
    if (open && items.length === 0) {
      fetchPage(true);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll infinito
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const { scrollTop, clientHeight, scrollHeight } = element;
    
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      setPage(prev => prev + 1);
      setTimeout(() => fetchPage(false), 50);
    }
  };

  // Verificar se item está selecionado
  const isSelected = (id: Item["id"]) => {
    if (!value) return false;
    
    if (multiple) {
      return Array.isArray(value) ? value.includes(String(id)) : false;
    }
    
    return String(value) === String(id);
  };

  // Toggle seleção de item
  const toggle = (item: Item) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? [...value] : [];
      const stringId = String(item.id);
      const index = currentValues.indexOf(stringId);
      
      if (index >= 0) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(stringId);
      }
      
      onChange(currentValues);
    } else {
      onChange(String(item.id));
      setOpen(false);
    }
  };

  // Remover item específico (para múltipla seleção)
  const removeItem = (id: Item["id"]) => {
    if (multiple && Array.isArray(value)) {
      const newValues = value.filter(v => String(v) !== String(id));
      onChange(newValues);
    }
  };

  // Limpar seleção
  const clear = () => {
    onChange(multiple ? [] : null);
  };

  // Obter itens selecionados para exibição
  const getSelectedItems = () => {
    if (!value) return [];
    
    if (multiple && Array.isArray(value)) {
      return items.filter(item => value.includes(String(item.id)));
    }
    
    const selected = items.find(item => String(item.id) === String(value));
    return selected ? [selected] : [];
  };

  // Renderizar texto do botão
  const renderButtonText = () => {
    const selectedItems = getSelectedItems();
    
    if (selectedItems.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1 max-w-full">
          {selectedItems.slice(0, 3).map(item => (
            <Badge 
              key={String(item.id)} 
              variant="secondary" 
              className="text-xs"
            >
              {item.label}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeItem(item.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedItems.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedItems.length - 3}
            </Badge>
          )}
        </div>
      );
    }

    return <span className="truncate">{selectedItems[0]?.label}</span>;
  };

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between min-h-10",
              error && "border-destructive",
              "hover:bg-accent/50"
            )}
          >
            <div className="flex-1 text-left overflow-hidden">
              {renderButtonText()}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="z-[9999] w-[var(--radix-popover-trigger-width)] p-0"
          avoidCollisions={true}
          collisionPadding={8}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Digite para buscar..."
              value={query}
              onValueChange={setQuery}
              className="h-9"
            />
            
            <CommandList onScroll={handleScroll} className="max-h-72">
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-6">
                    <span className="text-sm text-muted-foreground">
                      {query ? `Nenhum resultado para "${query}"` : "Nenhum item encontrado"}
                    </span>
                    {onCreateClick && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          onCreateClick();
                          setOpen(false);
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Criar novo
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
              )}

              {items.length > 0 && (
                <CommandGroup>
                  {items.map(item => (
                    <CommandItem
                      key={String(item.id)}
                      value={String(item.id)}
                      onSelect={() => toggle(item)}
                      className="flex items-center"
                    >
                      <Check 
                        className={cn(
                          "mr-2 h-4 w-4", 
                          isSelected(item.id) ? "opacity-100" : "opacity-0"
                        )} 
                      />
                      <span className="truncate flex-1">{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Footer com informações e ações */}
              <CommandSeparator />
              <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                <span>
                  {loading && items.length > 0 ? "Carregando..." : 
                   hasMore ? "Role para carregar mais" : 
                   `${items.length} de ${totalCount} itens`}
                </span>
                
                {(value && ((multiple && Array.isArray(value) && value.length > 0) || (!multiple && value))) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clear();
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <FormMessage />
    </FormItem>
  );
}