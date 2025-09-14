import React, { useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FormShellV4 } from './FormShellV4';
import { FormSectionV4 } from './FormSectionV4';
import { BasicInfoGroup, TypeGroup, ContactGroup, LocationGroup, MediaGroup } from './field-groups';
import { EntityType, ENTITY_CONFIGS } from './types';
import { useEntityUpsert } from './hooks/useEntityUpsert';

interface EntityFormV4Props<T extends FieldValues> {
  entityType: EntityType;
  form: UseFormReturn<T>;
  onSubmit?: (data: T) => void;
  onBack?: () => void;
  className?: string;
}

export function EntityFormV4<T extends FieldValues>({
  entityType,
  form,
  onSubmit,
  onBack,
  className
}: EntityFormV4Props<T>) {
  const config = ENTITY_CONFIGS[entityType];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true, // Sempre aberto por padrão
    type: false,
    contact: false,
    location: false,
    media: false,
    links: false,
    professional: false,
    business: false,
    capacity: false,
    features: false,
    internal: false,
  });

  const entityUpsert = useEntityUpsert({
    entityType,
    onSuccess: (result) => {
      if (onSubmit) {
        onSubmit(result);
      }
    }
  });

  const handleSubmit = (data: T) => {
    console.log(`Submitting ${entityType} form:`, data);
    entityUpsert.mutate(data);
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderSectionContent = (sectionId: string) => {
    const commonProps = {
      form,
      entityType,
      className: "space-y-4"
    };

    switch (sectionId) {
      case 'basic':
        return <BasicInfoGroup {...commonProps} />;
      
      case 'type':
        return <TypeGroup {...commonProps} />;
      
      case 'contact':
        return <ContactGroup {...commonProps} />;
      
      case 'location':
        return <LocationGroup {...commonProps} />;
      
      case 'media':
        return <MediaGroup {...commonProps} />;
      
      case 'links':
        return (
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Seção de links será implementada em breve
            </p>
          </div>
        );
      
      case 'professional':
        return (
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Detalhes profissionais serão implementados em breve
            </p>
          </div>
        );
      
      case 'business':
        return (
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Informações comerciais serão implementadas em breve
            </p>
          </div>
        );
      
      case 'capacity':
        return (
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Capacidade e horários serão implementados em breve
            </p>
          </div>
        );
      
      case 'features':
        return (
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Características serão implementadas em breve
            </p>
          </div>
        );
      
      case 'internal':
        return (
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Controles internos serão implementados em breve
            </p>
          </div>
        );
      
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Seção não implementada: {sectionId}
          </div>
        );
    }
  };

  return (
    <FormShellV4
      config={config}
      form={form}
      onSubmit={handleSubmit}
      onBack={onBack}
      isLoading={entityUpsert.isPending}
      className={className}
    >
      <div className="space-y-4">
        {config.sections.map((section) => (
          <FormSectionV4
            key={section.id}
            section={section}
            form={form}
            isOpen={openSections[section.id]}
            onToggle={(open) => toggleSection(section.id)}
          >
            {renderSectionContent(section.id)}
          </FormSectionV4>
        ))}
      </div>
    </FormShellV4>
  );
}