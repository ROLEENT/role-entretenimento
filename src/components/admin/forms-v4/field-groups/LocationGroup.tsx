import React from 'react';
import { FieldValues } from 'react-hook-form';
import { RHFInput, RHFMaskedInput } from '@/components/form';
import { FieldGroupProps } from '../types';

export function LocationGroup<T extends FieldValues>({ 
  form, 
  entityType, 
  className 
}: FieldGroupProps<T>) {
  
  // Este grupo é específico para venues que precisam de endereço completo
  if (entityType !== 'venue') {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="city"
            label="Cidade"
            placeholder="São Paulo"
            description="Cidade principal de atuação"
          />
          
          <RHFInput
            name="state"
            label="Estado/Região"
            placeholder="SP"
            description="Estado ou região"
          />
        </div>
        
        <RHFInput
          name="country"
          label="País"
          placeholder="Brasil"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <RHFInput
        name="address_line"
        label="Endereço"
        placeholder="Rua, número, complemento"
        description="Endereço completo do venue"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RHFInput
          name="district"
          label="Bairro"
          placeholder="Vila Madalena"
          description="Bairro do venue"
        />
        
        <RHFInput
          name="city"
          label="Cidade"
          placeholder="São Paulo"
          description="Cidade do venue"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RHFInput
          name="state"
          label="Estado"
          placeholder="SP"
          description="Estado do venue"
        />
        
        <RHFMaskedInput
          name="postal_code"
          label="CEP"
          placeholder="00000-000"
          mask="cep"
          description="CEP do endereço"
        />
        
        <RHFInput
          name="country"
          label="País"
          placeholder="Brasil"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RHFInput
          name="latitude"
          label="Latitude"
          type="number"
          placeholder="-23.5505"
        />
        
        <RHFInput
          name="longitude"
          label="Longitude"
          type="number"
          placeholder="-46.6333"
        />
      </div>
    </div>
  );
}