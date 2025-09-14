import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizerEnhancedSchema, OrganizerEnhancedForm } from '@/schemas/entities/organizer-enhanced';
import { EntityFormV4 } from '../EntityFormV4';

interface OrganizerFormV4Props {
  initialData?: Partial<OrganizerEnhancedForm>;
  onSubmit?: (data: any) => void;
  onBack?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function OrganizerFormV4({
  initialData,
  onSubmit,
  onBack,
  isLoading,
  className
}: OrganizerFormV4Props) {
  const form = useForm<OrganizerEnhancedForm>({
    resolver: zodResolver(organizerEnhancedSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: 'coletivo',
      city: '',
      state: '',
      country: 'Brasil',
      manifesto: '',
      bio_short: '',
      about: '',
      email: '',
      phone: '',
      whatsapp: '',
      instagram: '',
      website: '',
      logo_url: '',
      logo_alt: '',
      cover_url: '',
      cover_alt: '',
      gallery: [],
      links: {
        instagram: '',
        facebook: '',
        linkedin: '',
        youtube: '',
        website: '',
        other: []
      },
      collective_members: 0,
      collective_philosophy: '',
      collective_areas: [],
      company_cnpj: '',
      company_size: 'pequena',
      specialties: [],
      portfolio_highlights: [],
      roster_size: 0,
      territories: [],
      services: [],
      commission_structure: '',
      professional_experience: '',
      education_background: '',
      certifications: [],
      business_info: {
        legal_name: '',
        tax_id: '',
        address: '',
        legal_representative: ''
      },
      payment_info: {
        pix_key: '',
        bank_account: '',
        preferred_payment_method: 'pix'
      },
      areas_of_work: [],
      target_audience: [],
      event_types: [],
      booking_contact: {
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        role: ''
      },
      status: 'draft',
      priority: 0,
      internal_notes: '',
      tags: [],
      ...initialData
    }
  });

  return (
    <EntityFormV4
      entityType="organizer"
      form={form}
      onSubmit={onSubmit}
      onBack={onBack}
      className={className}
    />
  );
}