// Tipos base para formulários V4 - Arquitetura unificada
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

export type EntityType = 'artist' | 'organizer' | 'venue';

export interface BaseFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
  className?: string;
}

export interface FieldGroupProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  entityType?: EntityType;
  className?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  defaultOpen?: boolean;
}

export interface EntityFormConfig {
  title: string;
  description: string;
  sections: FormSection[];
  submitText: string;
  entityType: EntityType;
}

// Configurações padrão para cada entidade
export const ENTITY_CONFIGS: Record<EntityType, EntityFormConfig> = {
  artist: {
    title: "Artista",
    description: "Cadastro completo de artista",
    entityType: 'artist',
    submitText: "Salvar Artista",
    sections: [
      { id: 'basic', title: 'Informações Básicas', description: 'Dados principais do artista', required: true, defaultOpen: true },
      { id: 'type', title: 'Tipo e Categorias', description: 'Classificação do artista', required: true },
      { id: 'contact', title: 'Contato', description: 'Informações de contato', required: true },
      { id: 'media', title: 'Mídia', description: 'Imagens e galeria', required: true },
      { id: 'links', title: 'Links Externos', description: 'Redes sociais e portfólio' },
      { id: 'professional', title: 'Detalhes Profissionais', description: 'Informações específicas por tipo' },
      { id: 'business', title: 'Informações Comerciais', description: 'Cachê, disponibilidade, booking' },
      { id: 'internal', title: 'Interno', description: 'Notas internas e status' }
    ]
  },
  organizer: {
    title: "Organizador",
    description: "Cadastro completo de organizador",
    entityType: 'organizer',
    submitText: "Salvar Organizador",
    sections: [
      { id: 'basic', title: 'Informações Básicas', description: 'Dados principais do organizador', required: true, defaultOpen: true },
      { id: 'type', title: 'Tipo e Especialidades', description: 'Classificação do organizador', required: true },
      { id: 'contact', title: 'Contato', description: 'Informações de contato', required: true },
      { id: 'media', title: 'Mídia', description: 'Logo e imagens' },
      { id: 'links', title: 'Links Externos', description: 'Redes sociais e website' },
      { id: 'professional', title: 'Detalhes Profissionais', description: 'Informações específicas por tipo' },
      { id: 'business', title: 'Informações Comerciais', description: 'Dados legais e financeiros' },
      { id: 'internal', title: 'Interno', description: 'Notas internas e status' }
    ]
  },
  venue: {
    title: "Venue",
    description: "Cadastro completo de venue",
    entityType: 'venue',
    submitText: "Salvar Venue",
    sections: [
      { id: 'basic', title: 'Informações Básicas', description: 'Dados principais do venue', required: true, defaultOpen: true },
      { id: 'type', title: 'Tipo e Características', description: 'Classificação do venue', required: true },
      { id: 'location', title: 'Localização', description: 'Endereço completo', required: true },
      { id: 'contact', title: 'Contato', description: 'Informações de contato', required: true },
      { id: 'media', title: 'Mídia', description: 'Logo e imagens', required: true },
      { id: 'capacity', title: 'Capacidade e Horários', description: 'Funcionamento e capacidade' },
      { id: 'features', title: 'Características', description: 'Infraestrutura e recursos' },
      { id: 'professional', title: 'Detalhes Profissionais', description: 'Informações específicas por tipo' },
      { id: 'business', title: 'Informações Comerciais', description: 'Contato para booking' },
      { id: 'internal', title: 'Interno', description: 'Notas internas e status' }
    ]
  }
};