import { RHFComboboxAsync } from "@/components/v5/forms/RHFComboboxAsync";
import { supabase } from "@/integrations/supabase/client";
import { ComboboxAsyncOption } from "@/components/ui/combobox-async";

interface VenueSelectAsyncProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  enableQuickCreate?: boolean;
}

export function VenueSelectAsync({
  name,
  label = "Local",
  placeholder = "Buscar local...",
  disabled = false,
  enableQuickCreate = true,
}: VenueSelectAsyncProps) {
  
  const searchVenues = async (query: string): Promise<ComboboxAsyncOption[]> => {
    let supabaseQuery = supabase
      .from('venues')
      .select('id, name, address, cities(name)')
      .order('name', { ascending: true })
      .limit(20);

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,address.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Erro ao buscar locais:', error);
      return [];
    }

    return (data || []).map(venue => ({
      id: venue.id,
      name: venue.name,
      value: venue.id,
      city: (venue.cities as any)?.name,
      subtitle: venue.address,
    }));
  };

  return (
    <RHFComboboxAsync
      name={name}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      onSearch={searchVenues}
      emptyText="Nenhum local encontrado"
      createNewText="Criar novo local"
      description="Selecione ou crie um local"
      enableQuickCreate={enableQuickCreate}
      quickCreateType="venue"
    />
  );
}