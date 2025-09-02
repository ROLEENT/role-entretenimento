import { RHFAsyncSelect } from '@/components/form/RHFAsyncSelect';
import { useGenresOptions } from '@/hooks/useGenresOptions';

interface GenreSelectProps {
  name?: string;
  label?: string;
  placeholder?: string;
}

export function GenreSelect({ 
  name = "genres",
  label = "Gêneros Musicais",
  placeholder = "Selecione os gêneros musicais"
}: GenreSelectProps) {
  const { searchGenres, createGenre, loading } = useGenresOptions();

  return (
    <RHFAsyncSelect
      name={name}
      label={label}
      placeholder={placeholder}
      table="genres"
      valueField="id"
      labelField="name"
      searchField="name"
      isMulti={true}
    />
  );
}