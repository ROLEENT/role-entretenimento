import { RHFComboboxAsync } from "@/components/v5/forms/RHFComboboxAsync";
import { supabase } from "@/integrations/supabase/client";
import { ComboboxAsyncOption } from "@/components/ui/combobox-async";

interface OrganizerSelectAsyncProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  enableQuickCreate?: boolean;
}

export function OrganizerSelectAsync({
  name,
  label = "Organizador",
  placeholder = "Buscar organizador...",
  disabled = false,
  enableQuickCreate = true,
}: OrganizerSelectAsyncProps) {
  
  const searchOrganizers = async (query: string): Promise<ComboboxAsyncOption[]> => {
    let supabaseQuery = supabase
      .from('organizers')
      .select('id, name, contact_email, cities(name)')
      .order('name', { ascending: true })
      .limit(20);

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,contact_email.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Erro ao buscar organizadores:', error);
      return [];
    }

    return (data || []).map(organizer => ({
      id: organizer.id,
      name: organizer.name,
      value: organizer.id,
      city: (organizer.cities as any)?.name,
      subtitle: organizer.contact_email,
    }));
  };

  return (
    <RHFComboboxAsync
      name={name}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      onSearch={searchOrganizers}
      emptyText="Nenhum organizador encontrado"
      createNewText="Criar novo organizador"
      description="Selecione ou crie um organizador"
      enableQuickCreate={enableQuickCreate}
      quickCreateType="organizer"
    />
  );
}