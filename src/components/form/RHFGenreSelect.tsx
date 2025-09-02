import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useGenresOptions } from '@/hooks/useGenresOptions';
import { useState } from "react";

interface RHFGenreSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  maxGenres?: number;
}

export function RHFGenreSelect({
  name,
  label = "Gêneros Musicais",
  placeholder = "Digite para buscar ou criar gênero",
  maxGenres = 5
}: RHFGenreSelectProps) {
  const { control, formState: { errors } } = useFormContext();
  const { searchGenres, createGenre, loading } = useGenresOptions();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ label: string; value: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fieldError = errors[name];

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    if (value.length > 1) {
      const results = await searchGenres(value);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addGenre = async (genre: { label: string; value: string }, currentGenres: string[], onChange: (value: string[]) => void) => {
    if (currentGenres.length >= maxGenres) return;
    if (!currentGenres.includes(genre.value)) {
      onChange([...currentGenres, genre.value]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeGenre = (genreId: string, currentGenres: string[], onChange: (value: string[]) => void) => {
    onChange(currentGenres.filter(id => id !== genreId));
  };

  const handleCreateGenre = async (name: string, currentGenres: string[], onChange: (value: string[]) => void) => {
    try {
      const newGenre = await createGenre(name);
      await addGenre(newGenre, currentGenres, onChange);
    } catch (error) {
      console.error('Erro ao criar gênero:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentGenres: string[], onChange: (value: string[]) => void) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Buscar se já existe um gênero com esse nome
      const existingGenre = suggestions.find(s => s.label.toLowerCase() === inputValue.toLowerCase());
      if (existingGenre) {
        addGenre(existingGenre, currentGenres, onChange);
      } else {
        // Criar novo gênero
        handleCreateGenre(inputValue.trim(), currentGenres, onChange);
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
            {/* Selected Genres Display */}
            {value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.map((genreId: string) => {
                  const genre = suggestions.find(s => s.value === genreId);
                  return (
                    <Badge key={genreId} variant="secondary" className="flex items-center gap-1">
                      {genre?.label || genreId}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4"
                        onClick={() => removeGenre(genreId, value, onChange)}
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
                placeholder={value.length >= maxGenres ? `Máximo ${maxGenres} gêneros` : placeholder}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, value, onChange)}
                disabled={value.length >= maxGenres || loading}
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
                      className="w-full justify-start text-left p-2 h-auto"
                      onClick={() => addGenre(suggestion, value, onChange)}
                      disabled={value.includes(suggestion.value)}
                    >
                      {suggestion.label}
                    </Button>
                  ))}
                  {inputValue && !suggestions.some(s => s.label.toLowerCase() === inputValue.toLowerCase()) && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start text-left p-2 h-auto border-t"
                      onClick={() => handleCreateGenre(inputValue.trim(), value, onChange)}
                    >
                      Criar: "{inputValue}"
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Helper Text */}
            <p className="text-sm text-muted-foreground">
              {value.length}/{maxGenres} gêneros selecionados
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