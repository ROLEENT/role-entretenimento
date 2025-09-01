import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CreateProfile } from '../../schemas';
import { ArtistFields } from '../type-specific/ArtistFields';
import { VenueFields } from '../type-specific/VenueFields';
import { OrganizerFields } from '../type-specific/OrganizerFields';

interface SpecificFieldsStepProps {
  form: UseFormReturn<CreateProfile>;
  type: string;
}

export function SpecificFieldsStep({ form, type }: SpecificFieldsStepProps) {
  const renderFields = () => {
    switch (type) {
      case 'artista':
        return <ArtistFields form={form} />;
      case 'local':
        return <VenueFields form={form} />;
      case 'organizador':
        return <OrganizerFields form={form} />;
      default:
        return <div>Tipo de perfil não reconhecido</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          Campos Específicos - {type === 'artista' ? 'Artista' : type === 'local' ? 'Local' : 'Organizador'}
        </h3>
        <p className="text-muted-foreground">
          Preencha as informações específicas para o seu tipo de perfil
        </p>
      </div>

      {renderFields()}
    </div>
  );
}