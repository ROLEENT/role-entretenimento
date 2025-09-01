import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VenueCharacteristicsFields } from '@/components/agentes/VenueCharacteristicsFields';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';

interface VenueAmenitiesTabProps {
  form: UseFormReturn<VenueFlexibleFormData>;
}

export const VenueAmenitiesTab: React.FC<VenueAmenitiesTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <VenueCharacteristicsFields />
    </div>
  );
};