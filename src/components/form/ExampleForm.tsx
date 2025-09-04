"use client";

import { ReactNode } from "react";
import FormSection, { FORM_SECTIONS } from "./FormSection";
import FormLayout from "./FormLayout";
import RHFInput from "./RHFInput";
import RHFTextarea from "./RHFTextarea";
import RHFSwitch from "./RHFSwitch";
import { RHFSelect } from "./RHFSelect";
import { RHFSelectAsync } from "./RHFSelectAsync";
import RHFDateTime from "./RHFDateTime";
import RHFUpload from "./RHFUpload";

// Example form using the standardized sections
interface ExampleFormProps {
  disabled?: boolean;
}

export default function ExampleForm({ disabled = false }: ExampleFormProps) {
  const sections = [
    {
      key: "BASIC_INFO" as const,
      defaultOpen: true,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="title"
            label="Título"
            placeholder="Nome do evento"
            disabled={disabled}
          />
          <RHFInput
            name="subtitle"
            label="Subtítulo"
            placeholder="Descrição curta"
            disabled={disabled}
          />
          <div className="md:col-span-2">
            <RHFTextarea
              name="summary"
              label="Resumo"
              placeholder="Descrição do evento"
              disabled={disabled}
            />
          </div>
          <RHFSwitch
            name="featured"
            label="Destacar evento"
            description="Aparece na página inicial"
            disabled={disabled}
          />
        </div>
      ),
    },
    {
      key: "DATES" as const,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFDateTime
            name="start_at"
            label="Data e Hora de Início"
            disabled={disabled}
          />
          <RHFDateTime
            name="end_at"
            label="Data e Hora de Fim"
            disabled={disabled}
          />
          <RHFDateTime
            name="publish_at"
            label="Data de Publicação"
            disabled={disabled}
          />
          <RHFDateTime
            name="unpublish_at"
            label="Data de Despublicação"
            disabled={disabled}
          />
        </div>
      ),
    },
    {
      key: "LOCATION" as const,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFSelectAsync
            name="city_id"
            label="Cidade"
            query={{ table: "cities", fields: "id,name,uf", orderBy: "name" }}
            mapRow={(r) => ({ value: String(r.id), label: `${r.name} - ${r.uf}` })}
            parseValue={(v) => Number(v)}
            serializeValue={(v) => String(v ?? "")}
            placeholder="Selecione a cidade"
            disabled={disabled}
          />
          <RHFInput
            name="location_name"
            label="Nome do Local"
            placeholder="Ex: Teatro Municipal"
            disabled={disabled}
          />
          <RHFInput
            name="address"
            label="Endereço"
            placeholder="Rua, número"
            disabled={disabled}
          />
          <RHFInput
            name="neighborhood"
            label="Bairro"
            placeholder="Nome do bairro"
            disabled={disabled}
          />
        </div>
      ),
    },
    {
      key: "CONTENT" as const,
      content: (
        <div className="space-y-4">
          <RHFInput
            name="ticket_url"
            label="URL dos Ingressos"
            placeholder="https://..."
            disabled={disabled}
          />
          <RHFInput
            name="source_url"
            label="URL da Fonte"
            placeholder="Link para mais informações"
            disabled={disabled}
          />
          <RHFSelect
            name="age_rating"
            label="Classificação Etária"
            options={[
              { value: "livre", label: "Livre" },
              { value: "12", label: "12 anos" },
              { value: "14", label: "14 anos" },
              { value: "16", label: "16 anos" },
              { value: "18", label: "18 anos" },
            ]}
            placeholder="Selecione a idade mínima"
            disabled={disabled}
          />
        </div>
      ),
    },
    {
      key: "MEDIA" as const,
      content: (
        <div className="space-y-4">
          <RHFUpload
            name="cover_url"
            bucket="agenda-images"
            label="Imagem de Capa"
            disabled={disabled}
          />
          <RHFInput
            name="alt_text"
            label="Texto Alternativo"
            placeholder="Descrição da imagem para acessibilidade"
            disabled={disabled}
          />
        </div>
      ),
    },
    {
      key: "SEO" as const,
      content: (
        <div className="space-y-4">
          <RHFInput
            name="meta_title"
            label="Meta Título"
            placeholder="Título para SEO (max 60 chars)"
            disabled={disabled}
          />
          <RHFTextarea
            name="meta_description"
            label="Meta Descrição"
            placeholder="Descrição para SEO (max 160 chars)"
            disabled={disabled}
          />
          <RHFInput
            name="canonical_url"
            label="URL Canônica"
            placeholder="https://..."
            disabled={disabled}
          />
          <RHFSwitch
            name="noindex"
            label="No Index"
            description="Impede indexação por motores de busca"
            disabled={disabled}
          />
        </div>
      ),
    },
  ];

  return <FormLayout sections={sections} />;
}