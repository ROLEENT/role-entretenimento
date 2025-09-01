"use client";
import RHFSelect from '@/components/form/RHFSelect';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

interface StatusSelectProps {
  name?: string;
  placeholder?: string;
}

export default function StatusSelect({ 
  name = "status",
  placeholder = "Status"
}: StatusSelectProps) {
  return (
    <RHFSelect
      name={name}
      options={STATUS_OPTIONS}
      placeholder={placeholder}
    />
  );
}