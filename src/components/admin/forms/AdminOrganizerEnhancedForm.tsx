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
  organizer?: any; // Raw organizer data from database
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
      city: organizer?.city || '',
      state: organizer?.state || '',
      country: organizer?.country || 'Brasil',
      manifesto: organizer?.bio || organizer?.about || '',
      bio_short: organizer?.bio_short || '',
      about: organizer?.about || organizer?.bio || '',
      email: organizer?.email || organizer?.contact_email || '',
      phone: organizer?.phone || '',
      whatsapp: organizer?.whatsapp || organizer?.contact_whatsapp || '',
      instagram: organizer?.instagram || '',
      website: organizer?.website || organizer?.site || organizer?.site_url || '',
      logo_url: organizer?.avatar_url || '',
      logo_alt: organizer?.avatar_alt || '',
      cover_url: organizer?.cover_url || '',
      cover_alt: organizer?.cover_alt || '',
      gallery: [],
      links: {
        instagram: organizer?.instagram || '',
        facebook: '',
        linkedin: '',
        youtube: '',
        website: organizer?.website || organizer?.site || '',
        other: []
      },
      collective_members: undefined,
      collective_philosophy: '',
      collective_areas: [],
      company_cnpj: '',
      company_size: undefined,
      specialties: [],
      portfolio_highlights: [],
      roster_size: undefined,
      territories: [],
      services: [],
      commission_structure: '',
      professional_experience: '',
      education_background: '',
      certifications: [],
      business_info: {
        legal_name: organizer?.invoice_name || '',
        tax_id: organizer?.tax_id || '',
        address: '',
        legal_representative: ''
      },
      payment_info: {
        pix_key: organizer?.pix_key || '',
        bank_account: '',
        preferred_payment_method: undefined
      },
      areas_of_work: [],
      target_audience: [],
      event_types: [],
      booking_contact: {
        name: organizer?.booking_contact?.name || '',
        email: organizer?.booking_email || '',
        phone: organizer?.booking_contact?.phone || '',
        whatsapp: organizer?.booking_whatsapp || '',
        role: organizer?.booking_contact?.role || ''
      },
      status: organizer?.status === 'active' ? 'published' : 'draft',
      priority: 0,
      internal_notes: '',
      tags: organizer?.tags || [],
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