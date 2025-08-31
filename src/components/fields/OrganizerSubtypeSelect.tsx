"use client";
import { RHFSelect } from '@/components/form/RHFSelect';

const ORGANIZER_SUBTYPES = [
  { value: 'organizador', label: 'Organizador' },
  { value: 'produtora', label: 'Produtora' },
  { value: 'coletivo', label: 'Coletivo' },
  { value: 'selo', label: 'Selo' },
];

interface OrganizerSubtypeSelectProps {
  name?: string;
  placeholder?: string;
}

export default function OrganizerSubtypeSelect({ 
  name = "organizer_subtype",
  placeholder = "Tipo de organizador"
}: OrganizerSubtypeSelectProps) {
  return (
    <RHFSelect
      name={name}
      options={ORGANIZER_SUBTYPES}
      placeholder={placeholder}
    />
  );
}