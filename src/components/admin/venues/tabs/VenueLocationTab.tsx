import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VenueAddressFields } from '@/components/agentes/VenueAddressFields';
import { VenueFormData } from '@/schemas/venue';

interface VenueLocationTabProps {
  form: UseFormReturn<VenueFormData>;
}

export const VenueLocationTab: React.FC<VenueLocationTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <VenueAddressFields />
    </div>
  );
};