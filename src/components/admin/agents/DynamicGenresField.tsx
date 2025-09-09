import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { AgentesTagsInput } from "@/components/agentes/AgentesTagsInput";

// Predefined suggestions for different genre types
const ACTING_GENRE_SUGGESTIONS = [
  "drag performance",
  "lipsync", 
  "dança",
  "performance cênica",
  "vogue",
  "teatro musical",
  "improviso",
  "stand-up",
  "burlesco",
  "pole dance",
  "clown",
  "live art",
  "teatro",
  "tributos pop"
];

const MUSIC_GENRE_SUGGESTIONS = [
  "house",
  "techno", 
  "funk",
  "disco",
  "pop",
  "r&b",
  "hip hop",
  "trap",
  "electro",
  "itálo",
  "garage",
  "breaks",
  "hard techno",
  "ambient"
];

// Categories that indicate acting
const ACTING_CATEGORIES = [
  "drag", "drag queen", "drag king", "performer", "ator", "atriz", 
  "dançarino", "bailarino", "teatro", "burlesco"
];

// Categories that indicate music
const MUSIC_CATEGORIES = [
  "dj", "produtor musical", "cantor", "mc", "banda", "instrumentista"
];

interface DynamicGenresFieldProps {
  categoryName?: string;
}

export function DynamicGenresField({ categoryName }: DynamicGenresFieldProps) {
  const { watch, setValue, getValues } = useFormContext();
  
  // Watch the category field to determine which genre fields to show
  const categoryId = watch("category_id");
  const musicGenres = watch("music_genres") || [];
  const actingGenres = watch("acting_genres") || [];

  // Determine what type of categories are selected based on the category name
  const hasActingCategory = categoryName ? 
    ACTING_CATEGORIES.some(cat => categoryName.toLowerCase().includes(cat.toLowerCase())) : false;
    
  const hasMusicCategory = categoryName ? 
    MUSIC_CATEGORIES.some(cat => categoryName.toLowerCase().includes(cat.toLowerCase())) : false;

  // Clear irrelevant genres when category changes
  useEffect(() => {
    if (!hasActingCategory && actingGenres.length > 0) {
      setValue("acting_genres", []);
    }
    if (!hasMusicCategory && musicGenres.length > 0) {
      setValue("music_genres", []);
    }
  }, [hasActingCategory, hasMusicCategory, actingGenres.length, musicGenres.length, setValue]);

  const showActingGenres = hasActingCategory;
  const showMusicGenres = hasMusicCategory;

  // Don't render anything if no relevant categories are selected
  if (!showActingGenres && !showMusicGenres) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Gêneros</h3>
      
      {showActingGenres && (
        <div className="space-y-2">
          <AgentesTagsInput
            name="acting_genres"
            label="Gêneros de Atuação"
            placeholder="Digite um gênero de atuação... Ex: drag performance, teatro"
            maxTags={5}
          />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Sugestões:</p>
            <div className="flex flex-wrap gap-1">
              {ACTING_GENRE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  onClick={() => {
                    const currentGenres = getValues("acting_genres") || [];
                    if (!currentGenres.includes(suggestion) && currentGenres.length < 5) {
                      setValue("acting_genres", [...currentGenres, suggestion]);
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showMusicGenres && (
        <div className="space-y-2">
          <AgentesTagsInput
            name="music_genres"
            label="Gêneros Musicais"
            placeholder="Digite um gênero musical... Ex: house, techno"
            maxTags={5}
          />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Sugestões:</p>
            <div className="flex flex-wrap gap-1">
              {MUSIC_GENRE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  onClick={() => {
                    const currentGenres = getValues("music_genres") || [];
                    if (!currentGenres.includes(suggestion) && currentGenres.length < 5) {
                      setValue("music_genres", [...currentGenres, suggestion]);
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}