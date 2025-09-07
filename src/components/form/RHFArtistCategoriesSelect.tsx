import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Briefcase } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { useAdminSession } from '@/hooks/useAdminSession';
import { toast } from "sonner";

interface RHFArtistCategoriesSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  maxCategories?: number;
}

interface CategoryOption {
  id: string;
  name: string;
  label: string;
  value: string;
}

export function RHFArtistCategoriesSelect({
  name,
  label = "Categorias/Funções",
  placeholder = "Digite para buscar categorias... Ex: DJ, Produtor, Cantor",
  maxCategories = 5
}: RHFArtistCategoriesSelectProps) {
  const { control } = useFormContext();
  const { adminEmail } = useAdminSession();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<CategoryOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchCategories = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .order('name')
        .limit(10);

      if (error) throw error;

      const categoryOptions: CategoryOption[] = (data || []).map(category => ({
        id: category.id,
        name: category.name,
        label: category.name,
        value: category.id
      }));

      setSuggestions(categoryOptions);
    } catch (error) {
      console.error('Error searching categories:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (name: string) => {
    try {
      if (!adminEmail) {
        throw new Error('Acesso negado: apenas administradores podem criar categorias');
      }

      // Gerar slug a partir do nome
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Usar cliente admin com headers corretos
      const adminClient = createAdminClient(adminEmail);

      const { data, error } = await adminClient
        .from('categories')
        .insert({ 
          name: name.trim(), 
          slug,
          kind: 'revista', // Tipo padrão para categorias de artista
          color: '#3b82f6', // Cor padrão
          is_active: true,
          description: `Categoria ${name.trim()}`
        })
        .select('id, name')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        label: data.name,
        value: data.id
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    if (value.length > 0) {
      await searchCategories(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addCategory = (field: any, category: CategoryOption) => {
    const currentCategories = field.value || [];
    if (currentCategories.length >= maxCategories) {
      toast.error(`Máximo de ${maxCategories} categorias permitidas`);
      return;
    }
    
    const exists = currentCategories.some((c: CategoryOption) => c.id === category.id);
    if (!exists) {
      field.onChange([...currentCategories, category]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeCategory = (field: any, categoryId: string) => {
    const currentCategories = field.value || [];
    field.onChange(currentCategories.filter((c: CategoryOption) => c.id !== categoryId));
  };

  const handleCreateCategory = async (field: any, name: string) => {
    try {
      setIsLoading(true);
      const newCategory = await createCategory(name);
      addCategory(field, newCategory);
      toast.success(`Categoria "${name}" criada e adicionada!`);
    } catch (error) {
      toast.error('Erro ao criar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        if (suggestions.length > 0) {
          addCategory(field, suggestions[0]);
        } else {
          handleCreateCategory(field, inputValue.trim());
        }
      }
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            {label}
          </FormLabel>
          <FormControl>
            <div className="space-y-3">
              {/* Selected Categories */}
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {field.value.map((category: CategoryOption) => (
                    <Badge key={category.id} variant="secondary" className="text-sm">
                      {category.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => removeCategory(field, category.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, field)}
                  placeholder={placeholder}
                  disabled={isLoading}
                />

                {/* Suggestions */}
                {showSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.length > 0 ? (
                      suggestions.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          onClick={() => addCategory(field, category)}
                        >
                          {category.name}
                        </button>
                      ))
                    ) : inputValue.trim() && adminEmail ? (
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2"
                        onClick={() => handleCreateCategory(field, inputValue.trim())}
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4" />
                        Criar "{inputValue}"
                      </button>
                    ) : inputValue.trim() ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Apenas administradores podem criar categorias
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Help text */}
              <p className="text-sm text-muted-foreground">
                Digite para buscar categorias existentes ou criar novas. Máximo {maxCategories} categorias.
              </p>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}