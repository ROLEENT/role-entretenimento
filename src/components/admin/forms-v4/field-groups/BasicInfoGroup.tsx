import React from 'react';
import { FieldValues } from 'react-hook-form';
import { RHFInput, RHFTextarea } from '@/components/form';
import RHFSlug from '@/components/form/RHFSlug';
import { FieldGroupProps, EntityType } from '../types';

export function BasicInfoGroup<T extends FieldValues>({ 
  form, 
  entityType, 
  className 
}: FieldGroupProps<T>) {
  
  const getFields = () => {
    switch (entityType) {
      case 'artist':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFInput
                name="name"
                label="Nome Artístico"
                placeholder="Nome do artista"
                description="Nome principal usado pelo artista"
              />
              
              <RHFInput
                name="handle"
                label="Handle/Username"
                placeholder="@nomedoartista"
                description="Identificador único, usado em URLs"
              />
            </div>
            
            <RHFSlug
              name="slug"
              label="Slug (URL)"
              placeholder="nome-do-artista"
              generateFrom="handle"
              table="artists"
            />
            
            <RHFTextarea
              name="bio_short"
              label="Bio Curta"
              placeholder="Descrição resumida do artista (20-500 caracteres)"
              rows={3}
            />
            
            <RHFTextarea
              name="bio_long"
              label="Bio Completa"
              placeholder="Biografia completa e detalhada (opcional)"
              rows={6}
            />
          </>
        );
        
      case 'organizer':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFInput
                name="name"
                label="Nome do Organizador"
                placeholder="Nome da organização ou pessoa"
                description="Nome principal do organizador"
              />
              
              <RHFSlug
                name="slug"
                label="Slug (URL)"
                placeholder="nome-organizador"
                generateFrom="name"
                table="organizers"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFInput
                name="city"
                label="Cidade"
                placeholder="São Paulo"
                description="Cidade principal de atuação"
              />
              
              <RHFInput
                name="state"
                label="Estado"
                placeholder="SP"
                description="Estado ou região"
              />
            </div>
            
            <RHFTextarea
              name="manifesto"
              label="Manifesto/Proposta"
              placeholder="Descreva a proposta e filosofia do organizador"
              rows={4}
            />
            
            <RHFTextarea
              name="bio_short"
              label="Descrição Resumida"
              placeholder="Descrição breve do organizador"
              rows={3}
            />
          </>
        );
        
      case 'venue':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFInput
                name="name"
                label="Nome do Venue"
                placeholder="Nome do estabelecimento"
                description="Nome oficial do venue"
              />
              
              <RHFSlug
                name="slug"
                label="Slug (URL)"
                placeholder="nome-venue"
                generateFrom="name"
                table="venues"
              />
            </div>
            
            <RHFTextarea
              name="bio_short"
              label="Descrição"
              placeholder="Descrição do venue, ambiente e proposta"
              rows={4}
            />
            
            <RHFTextarea
              name="about"
              label="Sobre o Venue"
              placeholder="História, conceito e detalhes do estabelecimento"
              rows={6}
            />
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {getFields()}
    </div>
  );
}