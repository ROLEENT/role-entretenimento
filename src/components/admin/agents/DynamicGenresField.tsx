import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { AgentesTagsInput } from "@/components/agentes/AgentesTagsInput";
import { useArtistCategory } from "@/hooks/useArtistCategory";

// Normalization function for accent and case insensitive comparison
const norm = (s?: string) =>
  s?.toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim() ?? '';

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

// Categories that indicate acting (normalized for comparison)
const ACTING = new Set([
  'drag', 'drag queen', 'drag king', 'performer', 'ator', 'atriz',
  'dancarino', 'bailarino', 'teatro', 'burlesco', 'vogue performer'
]);

// Categories that indicate music (normalized for comparison)
const MUSIC = new Set([
  'dj', 'produtor musical', 'cantor', 'mc', 'banda', 'instrumentista'
]);

interface DynamicGenresFieldProps {
  categoryName?: string;
}

export function DynamicGenresField({ categoryName }: DynamicGenresFieldProps) {
  const { watch, setValue, getValues } = useFormContext();
  
  // Watch both artist_type and category_id
  const artistType = watch("artist_type");
  const categoryId = watch("category_id");
  const musicGenres = watch("music_genres") || [];
  const actingGenres = watch("acting_genres") || [];

  // Get category data to map category_id to name
  const { data: categoryData } = useArtistCategory(categoryId);
  
  // Determine what type of categories are selected
  const tipoArtista = norm(artistType);
  const categorias: string[] = [];
  
  // Add category name from categoryData if available
  if (categoryData?.name) {
    categorias.push(norm(categoryData.name));
  }
  
  // Add categoryName prop if provided (for backward compatibility)
  if (categoryName) {
    categorias.push(norm(categoryName));
  }

  const hasActing = ACTING.has(tipoArtista) || categorias.some(c => ACTING.has(c));
  const hasMusic = MUSIC.has(tipoArtista) || categorias.some(c => MUSIC.has(c));

  // Clear irrelevant genres when category/type changes with proper revalidation
  useEffect(() => {
    if (!hasActing && actingGenres.length > 0) {
      setValue("acting_genres", [], { shouldDirty: true, shouldValidate: true });
    }
    if (!hasMusic && musicGenres.length > 0) {
      setValue("music_genres", [], { shouldDirty: true, shouldValidate: true });
    }
  }, [hasActing, hasMusic, actingGenres.length, musicGenres.length, setValue]);

  const showActingGenres = hasActing;
  const showMusicGenres = hasMusic;

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