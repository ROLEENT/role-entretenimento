import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VenueAddressFields } from '@/components/agentes/VenueAddressFields';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';

interface VenueLocationTabProps {
  form: UseFormReturn<VenueFlexibleFormData>;
}

export const VenueLocationTab: React.FC<VenueLocationTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <VenueAddressFields />
    </div>
  );
};