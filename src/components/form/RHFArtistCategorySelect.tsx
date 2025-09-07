import React, { useState, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Tag } from "lucide-react";
import { useArtistCategoriesOptions } from '@/hooks/useArtistCategoriesOptions';

interface RHFArtistCategorySelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  maxCategories?: number;
}

interface CategoryOption {
  id: string;
  name: string;
  source: string;
  display_name: string;
  label: string;
  value: string;
}

export function RHFArtistCategorySelect({
  name,
  label = "Categorias",
  placeholder = "Digite para buscar categorias... Ex: DJ, Produtor, Cantor",
  maxCategories = 8
}: RHFArtistCategorySelectProps) {
  const { control, formState: { errors } } = useFormContext();
  const { searchArtistCategories, createArtistCategory, loading } = useArtistCategoriesOptions();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<CategoryOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategoriesData, setSelectedCategoriesData] = useState<Map<string, CategoryOption>>(new Map());

  const fieldError = errors[name];

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    if (value.length > 1) {
      const results = await searchArtistCategories(value);
      // Convert SelectOption to CategoryOption format
      const categoryOptions: CategoryOption[] = results.map(result => ({
        id: result.value,
        name: result.label,
        source: 'unknown',
        display_name: result.label,
        label: result.label,
        value: result.value
      }));
      setSuggestions(categoryOptions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addCategory = async (category: CategoryOption, currentCategories: string[], onChange: (value: string[]) => void) => {
    if (currentCategories.length >= maxCategories) return;
    if (!currentCategories.includes(category.value)) {
      // Store category data for display
      setSelectedCategoriesData(prev => new Map(prev).set(category.value, category));
      onChange([...currentCategories, category.value]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeCategory = (categoryId: string, currentCategories: string[], onChange: (value: string[]) => void) => {
    // Remove from stored data
    setSelectedCategoriesData(prev => {
      const newMap = new Map(prev);
      newMap.delete(categoryId);
      return newMap;
    });
    onChange(currentCategories.filter(id => id !== categoryId));
  };

  const handleCreateCategory = async (name: string, currentCategories: string[], onChange: (value: string[]) => void) => {
    try {
      const newCategory = await createArtistCategory(name);
      const categoryOption: CategoryOption = {
        id: newCategory.value,
        name: newCategory.label,
        source: 'manual',
        display_name: newCategory.label,
        label: newCategory.label,
        value: newCategory.value
      };
      await addCategory(categoryOption, currentCategories, onChange);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentCategories: string[], onChange: (value: string[]) => void) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Buscar se já existe uma categoria com esse nome
      const existingCategory = suggestions.find(s => s.label.toLowerCase() === inputValue.toLowerCase());
      if (existingCategory) {
        addCategory(existingCategory, currentCategories, onChange);
      } else {
        // Criar nova categoria
        handleCreateCategory(inputValue.trim(), currentCategories, onChange);
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field: { value = [], onChange } }) => (
          <div className="space-y-3">
            {/* Selected Categories Display */}
            {value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.map((categoryId: string) => {
                  const categoryData = selectedCategoriesData.get(categoryId);
                  const displayName = categoryData?.display_name || categoryData?.name || categoryId;
                  
                  return (
                    <Badge 
                      key={categoryId} 
                      variant="secondary" 
                      className="flex items-center gap-1.5 pr-1 py-1 text-xs"
                    >
                      <span className="font-medium">{displayName}</span>
                      {categoryData?.source === 'manual' && (
                        <span className="text-xs opacity-70">🏷️</span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={() => removeCategory(categoryId, value, onChange)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Input Field */}
            <div className="relative">
              <Input
                type="text"
                placeholder={value.length >= maxCategories ? `Máximo ${maxCategories} categorias` : placeholder}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, value, onChange)}
                disabled={value.length >= maxCategories || loading}
                className={fieldError ? "border-destructive" : ""}
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.map((suggestion) => {
                    const isSelected = value.includes(suggestion.value);
                    const isMaxed = value.length >= maxCategories;
                    
                    return (
                      <Button
                        key={suggestion.value}
                        type="button"
                        variant="ghost"
                        className={`w-full justify-start text-left p-2 h-auto ${
                          isSelected 
                            ? 'bg-primary/10 text-primary cursor-not-allowed opacity-50' 
                            : isMaxed
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                        onClick={() => {
                          if (!isSelected && !isMaxed) {
                            addCategory(suggestion, value, onChange);
                          }
                        }}
                        disabled={isSelected || isMaxed}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{suggestion.display_name}</span>
                          <div className="flex items-center gap-1">
                            {isSelected && (
                              <span className="text-xs text-primary">✓</span>
                            )}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                  {inputValue && !suggestions.some(s => s.label.toLowerCase() === inputValue.toLowerCase()) && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start text-left p-2 h-auto border-t"
                      onClick={() => handleCreateCategory(inputValue.trim(), value, onChange)}
                    >
                      Criar: "{inputValue}"
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Helper Text */}
            <p className="text-sm text-muted-foreground">
              {value.length}/{maxCategories} categorias selecionadas
            </p>
          </div>
        )}
      />
      
      {fieldError && (
        <p className="text-sm text-destructive" role="alert">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}