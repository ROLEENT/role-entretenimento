import { RHFComboboxAsync } from "@/components/rhf/RHFComboboxAsync";
import { supabase } from "@/integrations/supabase/client";
import { ComboboxAsyncOption } from "@/components/ui/combobox-async";

interface EventSelectAsyncProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function EventSelectAsync({
  name,
  label = "Evento Relacionado",
  placeholder = "Buscar evento...",
  disabled = false,
}: EventSelectAsyncProps) {
  
  const searchEvents = async (query: string): Promise<ComboboxAsyncOption[]> => {
    let supabaseQuery = supabase
      .from('events')
      .select('id, title, city, date_start')
      .order('date_start', { ascending: false })
      .limit(20);

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query}%,city.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return [];
    }

    return (data || []).map(event => ({
      id: event.id,
      name: event.title,
      value: event.id,
      city: event.city,
      subtitle: new Date(event.date_start).toLocaleDateString('pt-BR'),
    }));
  };

  return (
    <RHFComboboxAsync
      name={name}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      onSearch={searchEvents}
      emptyText="Nenhum evento encontrado"
      description="Vincule esta revista a um evento específico"
    />
  );
}