import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VenueFormData } from '@/schemas/venue';
import { VenueBasicTab } from './tabs/VenueBasicTab';
import { VenueLocationTab } from './tabs/VenueLocationTab';
import { VenueContactTab } from './tabs/VenueContactTab';
import { VenueHoursTab } from './tabs/VenueHoursTab';
import { VenueCharacteristicsTab } from './tabs/VenueCharacteristicsTab';
import { VenueStructuresTab } from './tabs/VenueStructuresTab';
import { VenueSpecialtiesTab } from './tabs/VenueSpecialtiesTab';
import { VenueMediaTab } from './tabs/VenueMediaTab';

interface AdminVenueFormProps {
  form: UseFormReturn<VenueFormData>;
}

export const AdminVenueForm: React.FC<AdminVenueFormProps> = ({ form }) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="location">Localização</TabsTrigger>
        <TabsTrigger value="contact">Contato</TabsTrigger>
        <TabsTrigger value="hours">Horários</TabsTrigger>
        <TabsTrigger value="characteristics">Características</TabsTrigger>
        <TabsTrigger value="specialties">Especificações</TabsTrigger>
        <TabsTrigger value="media">Mídia</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="basic" className="space-y-6">
          <VenueBasicTab form={form} />
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <VenueLocationTab form={form} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <VenueContactTab form={form} />
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <VenueHoursTab form={form} />
        </TabsContent>

        <TabsContent value="characteristics" className="space-y-6">
          <VenueCharacteristicsTab form={form} />
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <VenueSpecialtiesTab form={form} />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <VenueMediaTab form={form} />
        </TabsContent>
      </div>
    </Tabs>
  );
};