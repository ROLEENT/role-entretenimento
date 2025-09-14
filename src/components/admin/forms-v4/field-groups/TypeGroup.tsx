import React from 'react';
import { FieldValues } from 'react-hook-form';
import { RHFSelect } from '@/components/form';
import { FieldGroupProps, EntityType } from '../types';
import { ARTIST_TYPES } from '@/schemas/entities/artist-enhanced';
import { ORGANIZER_TYPES } from '@/schemas/entities/organizer-enhanced';
import { VENUE_TYPES } from '@/schemas/entities/venue-enhanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TypeGroup<T extends FieldValues>({ 
  form, 
  entityType, 
  className 
}: FieldGroupProps<T>) {
  
  const watchedType = form.watch('type' as any);
  
  const getTypeOptions = () => {
    switch (entityType) {
      case 'artist':
        return ARTIST_TYPES;
      case 'organizer':
        return ORGANIZER_TYPES;
      case 'venue':
        return VENUE_TYPES;
      default:
        return [];
    }
  };
  
  const getTypeSpecificFields = () => {
    if (entityType === 'artist') {
      return (
        <div className="space-y-4">
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Seleção de categorias e gêneros será implementada em breve
            </p>
          </div>
        </div>
      );
    }
    
    if (entityType === 'organizer') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Seleção de áreas de atuação será implementada em breve
            </p>
          </div>
        </div>
      );
    }
    
    if (entityType === 'venue') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Seleção de gêneros musicais e ambiente será implementada em breve
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <RHFSelect
        name="type"
        label={`Tipo de ${entityType === 'artist' ? 'Artista' : entityType === 'organizer' ? 'Organizador' : 'Venue'}`}
        options={getTypeOptions()}
        placeholder="Selecione o tipo"
      />
      
      {watchedType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Detalhes Específicos para {getTypeOptions().find(t => t.value === watchedType)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getTypeSpecificFields()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}