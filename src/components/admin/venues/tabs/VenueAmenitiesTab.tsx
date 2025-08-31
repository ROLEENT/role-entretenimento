import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VenueAmenitiesFields } from '@/components/agentes/VenueAmenitiesFields';
import { VenueFormData } from '@/schemas/venue';

interface VenueAmenitiesTabProps {
  form: UseFormReturn<VenueFormData>;
}

export const VenueAmenitiesTab: React.FC<VenueAmenitiesTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <VenueAmenitiesFields />
    </div>
  );
};