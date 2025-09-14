import { RHFComboboxAsync } from "@/components/v5/forms/RHFComboboxAsync";
import { supabase } from "@/integrations/supabase/client";
import { ComboboxAsyncOption } from "@/components/ui/combobox-async";

interface ArtistSelectAsyncProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  enableQuickCreate?: boolean;
}

export function ArtistSelectAsync({
  name,
  label = "Artista",
  placeholder = "Buscar artista...",
  disabled = false,
  enableQuickCreate = true,
}: ArtistSelectAsyncProps) {
  
  const searchArtists = async (query: string): Promise<ComboboxAsyncOption[]> => {
    let supabaseQuery = supabase
      .from('artists')
      .select('id, stage_name, cities(name)')
      .order('stage_name', { ascending: true })
      .limit(20);

    if (query.trim()) {
      supabaseQuery = supabaseQuery.ilike('stage_name', `%${query}%`);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Erro ao buscar artistas:', error);
      return [];
    }

    return (data || []).map(artist => ({
      id: artist.id,
      name: artist.stage_name,
      value: artist.id,
      city: (artist.cities as any)?.name,
      subtitle: (artist.cities as any)?.name,
    }));
  };

  return (
    <RHFComboboxAsync
      name={name}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      onSearch={searchArtists}
      emptyText="Nenhum artista encontrado"
      createNewText="Criar novo artista"
      description="Selecione ou crie um artista"
      enableQuickCreate={enableQuickCreate}
      quickCreateType="artist"
    />
  );
}