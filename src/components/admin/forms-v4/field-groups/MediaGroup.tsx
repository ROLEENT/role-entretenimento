import React from 'react';
import { FieldValues } from 'react-hook-form';
import { RHFUpload, RHFInput } from '@/components/form';
import { FieldGroupProps, EntityType } from '../types';

export function MediaGroup<T extends FieldValues>({ 
  form, 
  entityType, 
  className 
}: FieldGroupProps<T>) {
  
  const getMainImageField = () => {
    switch (entityType) {
      case 'artist':
        return (
          <div className="space-y-4">
            <RHFUpload
              name="profile_image_url"
              bucket="artists"
              label="Foto de Perfil"
              accept="image/*"
            />
            
            <RHFInput
              name="profile_image_alt"
              label="Descrição da Imagem"
              placeholder="Descrição da foto para acessibilidade"
              description="Texto alternativo para a imagem"
            />
          </div>
        );
        
      case 'organizer':
        return (
          <div className="space-y-4">
            <RHFUpload
              name="logo_url"
              bucket="organizers"
              label="Logo do Organizador"
              accept="image/*"
            />
            
            <RHFInput
              name="logo_alt"
              label="Descrição da Logo"
              placeholder="Descrição da logo para acessibilidade"
              description="Texto alternativo para a logo"
            />
          </div>
        );
        
      case 'venue':
        return (
          <div className="space-y-4">
            <RHFUpload
              name="logo_url"
              bucket="venues"
              label="Logo do Venue"
              accept="image/*"
            />
            
            <RHFInput
              name="logo_alt"
              label="Descrição da Logo"
              placeholder="Descrição da logo para acessibilidade"
              description="Texto alternativo para a logo"
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const getCoverImageField = () => {
    return (
      <div className="space-y-4">
        <RHFUpload
          name="cover_url"
          bucket={entityType === 'artist' ? 'artists' : entityType === 'organizer' ? 'organizers' : 'venues'}
          label="Imagem de Capa"
          accept="image/*"
        />
        
        <RHFInput
          name="cover_alt"
          label="Descrição da Capa"
          placeholder="Descrição da imagem de capa"
          description="Texto alternativo para a capa"
        />
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Imagem Principal */}
      <div>
        <h4 className="text-sm font-medium mb-3">Imagem Principal</h4>
        {getMainImageField()}
      </div>
      
      {/* Imagem de Capa */}
      <div>
        <h4 className="text-sm font-medium mb-3">Imagem de Capa</h4>
        {getCoverImageField()}
      </div>
      
      {/* Galeria - TODO: Implementar componente de galeria */}
      <div>
        <h4 className="text-sm font-medium mb-3">Galeria</h4>
        <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Galeria de imagens será implementada em breve
          </p>
        </div>
      </div>
    </div>
  );
}