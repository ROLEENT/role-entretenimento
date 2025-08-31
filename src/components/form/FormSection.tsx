"use client";

import { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FormSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function FormSection({
  id,
  title,
  description,
  children,
  defaultOpen = false,
  className,
}: FormSectionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className={className}
    >
      <AccordionItem value={id} className="border rounded-lg">
        <AccordionTrigger 
          className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180"
          // Never disable the trigger - always allow open/close
          disabled={false}
        >
          <div className="flex flex-col items-start text-left">
            <span className="font-medium">{title}</span>
            {description && (
              <span className="text-sm text-muted-foreground font-normal">
                {description}
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// Predefined section configurations
export const FORM_SECTIONS = {
  BASIC_INFO: {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Nome, tipo, descrição e dados principais",
  },
  DATES: {
    id: "dates", 
    title: "Datas",
    description: "Horários de início, fim e publicação",
  },
  LOCATION: {
    id: "location",
    title: "Local & Cidade", 
    description: "Endereço, cidade e informações de localização",
  },
  LINEUP: {
    id: "lineup",
    title: "Line-up/Artistas",
    description: "Artistas participantes e organização do evento",
  },
  CONTENT: {
    id: "content",
    title: "Conteúdo & Links",
    description: "Descrições, links externos e informações adicionais",
  },
  MEDIA: {
    id: "media",
    title: "Mídia",
    description: "Imagens, vídeos e arquivos de mídia",
  },
  SEO: {
    id: "seo",
    title: "SEO",
    description: "Meta tags, URLs e otimização para busca",
  },
  RELATIONSHIPS: {
    id: "relationships",
    title: "Relacionamentos",
    description: "Conexões com outros eventos, categorias e tags",
  },
} as const;