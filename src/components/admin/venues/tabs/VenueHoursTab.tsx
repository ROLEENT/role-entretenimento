import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VenueOpeningHoursFields } from '@/components/agentes/VenueOpeningHoursFields';
import { VenueFormData } from '@/schemas/venue';

interface VenueHoursTabProps {
  form: UseFormReturn<VenueFormData>;
}

export const VenueHoursTab: React.FC<VenueHoursTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <VenueOpeningHoursFields />
    </div>
  );
};