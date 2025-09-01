import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VenueOpeningHoursFields } from '@/components/agentes/VenueOpeningHoursFields';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';

interface VenueHoursTabProps {
  form: UseFormReturn<VenueFlexibleFormData>;
}

export const VenueHoursTab: React.FC<VenueHoursTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <VenueOpeningHoursFields />
    </div>
  );
};