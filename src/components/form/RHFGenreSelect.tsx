import React, { useState, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Music } from "lucide-react";
import { useGenresOptions } from '@/hooks/useGenresOptions';

interface RHFGenreSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  maxGenres?: number;
}

interface GenreOption {
  id: string;
  name: string;
  parent_name?: string;
  source: string;
  display_name: string;
  label: string;
  value: string;
}

export function RHFGenreSelect({
  name,
  label = "Gêneros Musicais",
  placeholder = "Digite para buscar gêneros... Ex: techno, house, funk",
  maxGenres = 5
}: RHFGenreSelectProps) {
  const { control, formState: { errors } } = useFormContext();
  const { searchGenres, createGenre, loading } = useGenresOptions();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<GenreOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGenresData, setSelectedGenresData] = useState<Map<string, GenreOption>>(new Map());

  const fieldError = errors[name];

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    if (value.length > 1) {
      const results = await searchGenres(value);
      // Convert SelectOption to GenreOption format
      const genreOptions: GenreOption[] = results.map(result => ({
        id: result.value,
        name: result.label,
        parent_name: undefined,
        source: 'unknown',
        display_name: result.label,
        label: result.label,
        value: result.value
      }));
      setSuggestions(genreOptions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addGenre = async (genre: GenreOption, currentGenres: string[], onChange: (value: string[]) => void) => {
    if (currentGenres.length >= maxGenres) return;
    if (!currentGenres.includes(genre.value)) {
      // Store genre data for display
      setSelectedGenresData(prev => new Map(prev).set(genre.value, genre));
      onChange([...currentGenres, genre.value]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeGenre = (genreId: string, currentGenres: string[], onChange: (value: string[]) => void) => {
    // Remove from stored data
    setSelectedGenresData(prev => {
      const newMap = new Map(prev);
      newMap.delete(genreId);
      return newMap;
    });
    onChange(currentGenres.filter(id => id !== genreId));
  };

  const handleCreateGenre = async (name: string, currentGenres: string[], onChange: (value: string[]) => void) => {
    try {
      const newGenre = await createGenre(name);
      const genreOption: GenreOption = {
        id: newGenre.value,
        name: newGenre.label,
        source: 'manual',
        display_name: newGenre.label,
        label: newGenre.label,
        value: newGenre.value
      };
      await addGenre(genreOption, currentGenres, onChange);
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
                  const genreData = selectedGenresData.get(genreId);
                  const displayName = genreData?.display_name || genreData?.name || genreId;
                  const isHierarchical = genreData?.parent_name;
                  
                  return (
                    <Badge 
                      key={genreId} 
                      variant={isHierarchical ? "default" : "secondary"} 
                      className="flex items-center gap-1.5 pr-1 py-1 text-xs"
                    >
                      <span className="font-medium">{displayName}</span>
                      {genreData?.source === 'spotify' && (
                        <span className="text-xs opacity-70">🎵</span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
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
                  {suggestions.map((suggestion) => {
                    const isSelected = value.includes(suggestion.value);
                    const isMaxed = value.length >= maxGenres;
                    
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
                            addGenre(suggestion, value, onChange);
                          }
                        }}
                        disabled={isSelected || isMaxed}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{suggestion.display_name}</span>
                          <div className="flex items-center gap-1">
                            {suggestion.source === 'spotify' && (
                              <span className="text-xs">🎵</span>
                            )}
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