import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import { venueEnhancedSchema, VenueEnhancedForm } from '@/schemas/entities/venue-enhanced';
import { BasicInfoFields } from './entity-fields/BasicInfoFields';
import { ContactFields } from './entity-fields/ContactFields';
import { MediaFields } from './entity-fields/MediaFields';
import { VenueTypeFields } from './entity-fields/VenueTypeFields';
import { LocationFields } from './entity-fields/LocationFields';
import { BusinessFields } from './entity-fields/BusinessFields';

interface AdminVenueEnhancedFormProps {
  venue?: Partial<VenueEnhancedForm>;
  onSubmit: (data: VenueEnhancedForm) => void;
  isLoading?: boolean;
}

export const AdminVenueEnhancedForm: React.FC<AdminVenueEnhancedFormProps> = ({
  venue,
  onSubmit,
  isLoading = false
}) => {
  const form = useForm<VenueEnhancedForm>({
    resolver: zodResolver(venueEnhancedSchema),
    defaultValues: {
      name: venue?.name || '',
      type: venue?.type || 'bar',
      address_line: venue?.address_line || '',
      district: venue?.district || '',
      city: venue?.city || 'São Paulo',
      state: venue?.state || 'SP',
      postal_code: venue?.postal_code || '',
      country: venue?.country || 'Brasil',
      bio_short: venue?.bio_short || '',
      about: venue?.about || '',
      email: venue?.email || '',
      phone: venue?.phone || '',
      whatsapp: venue?.whatsapp || '',
      instagram: venue?.instagram || '',
      website: venue?.website || '',
      logo_url: venue?.logo_url || '',
      logo_alt: venue?.logo_alt || '',
      cover_url: venue?.cover_url || '',
      cover_alt: venue?.cover_alt || '',
      gallery: venue?.gallery || [],
      capacity: venue?.capacity || undefined,
      opening_hours: venue?.opening_hours || {},
      bar_style: venue?.bar_style || [],
      ambient_type: venue?.ambient_type || [],
      drink_specialties: venue?.drink_specialties || [],
      stage_type: venue?.stage_type || '',
      seating_capacity: venue?.seating_capacity || undefined,
      acoustic_treatment: venue?.acoustic_treatment || false,
      technical_equipment: venue?.technical_equipment || [],
      dance_floor_size: venue?.dance_floor_size || undefined,
      sound_system: venue?.sound_system || '',
      lighting_system: venue?.lighting_system || '',
      vip_areas: venue?.vip_areas || false,
      cuisine_type: venue?.cuisine_type || [],
      price_range: venue?.price_range || undefined,
      dining_style: venue?.dining_style || [],
      outdoor_seating: venue?.outdoor_seating || false,
      music_genres: venue?.music_genres || [],
      show_structure: venue?.show_structure || {
        stage: false,
        backstage: false,
        green_room: false,
        load_in: ''
      },
      features: venue?.features || {
        parking: false,
        wifi: false,
        air_conditioning: false,
        accessibility: false,
        security: false,
        coat_check: false,
        outdoor_area: false,
        private_events: false
      },
      booking_contact: venue?.booking_contact || {
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        role: ''
      },
      status: venue?.status || 'draft',
      priority: venue?.priority || 0,
      internal_notes: venue?.internal_notes || '',
      tags: venue?.tags || [],
      ...venue
    }
  });

  const handleSubmit = (data: VenueEnhancedForm) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="type-specific">Específico</TabsTrigger>
            <TabsTrigger value="business">Negócio</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <BasicInfoFields form={form} entityType="venue" />
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <LocationFields form={form} />
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <ContactFields form={form} />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <MediaFields form={form} entityType="venue" />
          </TabsContent>

          <TabsContent value="type-specific" className="space-y-6">
            <VenueTypeFields form={form} venueType={form.watch('type')} />
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <BusinessFields form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Local
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdminVenueEnhancedForm;