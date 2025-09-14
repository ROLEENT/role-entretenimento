import React from 'react';
import { FieldValues } from 'react-hook-form';
import { RHFInput } from '@/components/form';
import { FieldGroupProps, EntityType } from '../types';

export function ContactGroup<T extends FieldValues>({ 
  form, 
  entityType, 
  className 
}: FieldGroupProps<T>) {
  
  const getFields = () => {
    const commonFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="email"
            label="Email"
            type="email"
            placeholder="contato@exemplo.com"
            description="Email principal de contato"
          />
          
          <RHFInput
            name="phone"
            label="Telefone"
            placeholder="(11) 99999-9999"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="whatsapp"
            label="WhatsApp"
            placeholder="(11) 99999-9999"
          />
          
          <RHFInput
            name="instagram"
            label="Instagram"
            placeholder="@usuario"
          />
        </div>
      </>
    );
    
    if (entityType === 'venue') {
      return (
        <>
          {commonFields}
          <RHFInput
            name="website"
            label="Website"
            type="url"
            placeholder="https://www.venue.com"
            description="Site oficial do venue"
          />
        </>
      );
    }
    
    return commonFields;
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {getFields()}
    </div>
  );
}