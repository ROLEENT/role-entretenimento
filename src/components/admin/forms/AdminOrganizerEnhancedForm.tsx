import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import { organizerEnhancedSchema, OrganizerEnhancedForm } from '@/schemas/entities/organizer-enhanced';
import { BasicInfoFields } from './entity-fields/BasicInfoFields';
import { ContactFields } from './entity-fields/ContactFields';
import { MediaFields } from './entity-fields/MediaFields';
import { OrganizerTypeFields } from './entity-fields/OrganizerTypeFields';
import { BusinessFields } from './entity-fields/BusinessFields';

interface AdminOrganizerEnhancedFormProps {
  organizer?: Partial<OrganizerEnhancedForm>;
  onSubmit: (data: OrganizerEnhancedForm) => void;
  isLoading?: boolean;
}

export const AdminOrganizerEnhancedForm: React.FC<AdminOrganizerEnhancedFormProps> = ({
  organizer,
  onSubmit,
  isLoading = false
}) => {
  const form = useForm<OrganizerEnhancedForm>({
    resolver: zodResolver(organizerEnhancedSchema),
    defaultValues: {
      name: organizer?.name || '',
      type: organizer?.type || 'coletivo',
      city: organizer?.city || 'São Paulo',
      state: organizer?.state || 'SP',
      country: organizer?.country || 'Brasil',
      manifesto: organizer?.manifesto || '',
      bio_short: organizer?.bio_short || '',
      about: organizer?.about || '',
      email: organizer?.email || '',
      phone: organizer?.phone || '',
      whatsapp: organizer?.whatsapp || '',
      instagram: organizer?.instagram || '',
      website: organizer?.website || '',
      logo_url: organizer?.logo_url || '',
      logo_alt: organizer?.logo_alt || '',
      cover_url: organizer?.cover_url || '',
      cover_alt: organizer?.cover_alt || '',
      gallery: organizer?.gallery || [],
      links: organizer?.links || {
        instagram: '',
        facebook: '',
        linkedin: '',
        youtube: '',
        website: '',
        other: []
      },
      collective_members: organizer?.collective_members || undefined,
      collective_philosophy: organizer?.collective_philosophy || '',
      collective_areas: organizer?.collective_areas || [],
      company_cnpj: organizer?.company_cnpj || '',
      company_size: organizer?.company_size || undefined,
      specialties: organizer?.specialties || [],
      portfolio_highlights: organizer?.portfolio_highlights || [],
      roster_size: organizer?.roster_size || undefined,
      territories: organizer?.territories || [],
      services: organizer?.services || [],
      commission_structure: organizer?.commission_structure || '',
      professional_experience: organizer?.professional_experience || '',
      education_background: organizer?.education_background || '',
      certifications: organizer?.certifications || [],
      business_info: organizer?.business_info || {
        legal_name: '',
        tax_id: '',
        address: '',
        legal_representative: ''
      },
      payment_info: organizer?.payment_info || {
        pix_key: '',
        bank_account: '',
        preferred_payment_method: undefined
      },
      areas_of_work: organizer?.areas_of_work || [],
      target_audience: organizer?.target_audience || [],
      event_types: organizer?.event_types || [],
      booking_contact: organizer?.booking_contact || {
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        role: ''
      },
      status: organizer?.status || 'draft',
      priority: organizer?.priority || 0,
      internal_notes: organizer?.internal_notes || '',
      tags: organizer?.tags || [],
      ...organizer
    }
  });

  const handleSubmit = (data: OrganizerEnhancedForm) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="type-specific">Específico</TabsTrigger>
            <TabsTrigger value="business">Negócio</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <BasicInfoFields form={form} entityType="organizer" />
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <ContactFields form={form} />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <MediaFields form={form} entityType="organizer" />
          </TabsContent>

          <TabsContent value="type-specific" className="space-y-6">
            <OrganizerTypeFields form={form} organizerType={form.watch('type')} />
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <BusinessFields form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Organizador
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdminOrganizerEnhancedForm;