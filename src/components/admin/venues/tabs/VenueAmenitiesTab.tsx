import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VenueCharacteristicsFields } from '@/components/agentes/VenueCharacteristicsFields';
import { VenueFormData } from '@/schemas/venue';

interface VenueAmenitiesTabProps {
  form: UseFormReturn<VenueFormData>;
}

export const VenueAmenitiesTab: React.FC<VenueAmenitiesTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <VenueCharacteristicsFields />
    </div>
  );
};