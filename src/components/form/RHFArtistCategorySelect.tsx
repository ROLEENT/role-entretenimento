import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
  label: string;
  value: string;
}

export function RHFArtistCategorySelect({
  name,
  label = "Categoria",
  placeholder = "Digite para buscar categoria... Ex: DJ, Produtor, Cantor",
  maxCategories = 1
}: RHFArtistCategorySelectProps) {
  const { control, formState: { errors } } = useFormContext();
  const { searchArtistCategories, createArtistCategory, loading } = useArtistCategoriesOptions();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<CategoryOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);

  const fieldError = errors[name];

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    if (value.length > 1) {
      const results = await searchArtistCategories(value);
      // Convert SelectOption to CategoryOption format
      const categoryOptions: CategoryOption[] = results.map(result => ({
        id: result.value,
        name: result.label,
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

  const selectCategory = async (category: CategoryOption, onChange: (value: string) => void) => {
    setSelectedCategory(category);
    onChange(category.value);
    setInputValue("");
    setShowSuggestions(false);
  };

  const clearCategory = (onChange: (value: string) => void) => {
    setSelectedCategory(null);
    onChange("");
    setInputValue("");
  };

  const handleCreateCategory = async (name: string, onChange: (value: string) => void) => {
    try {
      const newCategory = await createArtistCategory(name);
      const categoryOption: CategoryOption = {
        id: newCategory.value,
        name: newCategory.label,
        label: newCategory.label,
        value: newCategory.value
      };
      await selectCategory(categoryOption, onChange);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, onChange: (value: string) => void) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Buscar se já existe uma categoria com esse nome
      const existingCategory = suggestions.find(s => s.label.toLowerCase() === inputValue.toLowerCase());
      if (existingCategory) {
        selectCategory(existingCategory, onChange);
      } else {
        // Criar nova categoria
        handleCreateCategory(inputValue.trim(), onChange);
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
        defaultValue=""
        render={({ field: { value, onChange } }) => (
          <div className="space-y-3">
            {/* Selected Category Display */}
            {value && selectedCategory && (
              <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <span className="font-medium">{selectedCategory.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  onClick={() => clearCategory(onChange)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Input Field - Only show if no category selected */}
            {!value && (
              <div className="relative">
                <Input
                  type="text"
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, onChange)}
                  disabled={loading}
                  className={fieldError ? "border-destructive" : ""}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion.value}
                        type="button"
                        variant="ghost"
                        className="w-full justify-start text-left p-2 h-auto hover:bg-accent hover:text-accent-foreground"
                        onClick={() => selectCategory(suggestion, onChange)}
                      >
                        <span className="font-medium">{suggestion.name}</span>
                      </Button>
                    ))}
                    {inputValue && !suggestions.some(s => s.label.toLowerCase() === inputValue.toLowerCase()) && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start text-left p-2 h-auto border-t"
                        onClick={() => handleCreateCategory(inputValue.trim(), onChange)}
                      >
                        Criar: "{inputValue}"
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
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

export default RHFArtistCategorySelect;