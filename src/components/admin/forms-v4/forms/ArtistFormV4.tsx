import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { artistEnhancedSchema, ArtistEnhancedForm } from '@/schemas/entities/artist-enhanced';
import { EntityFormV4 } from '../EntityFormV4';

interface ArtistFormV4Props {
  initialData?: Partial<ArtistEnhancedForm>;
  onSubmit?: (data: any) => void;
  onBack?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ArtistFormV4({
  initialData,
  onSubmit,
  onBack,
  isLoading,
  className
}: ArtistFormV4Props) {
  const form = useForm<ArtistEnhancedForm>({
    resolver: zodResolver(artistEnhancedSchema),
    defaultValues: {
      name: '',
      handle: '',
      slug: '',
      type: 'dj',
      categories: [],
      genres: [],
      city: '',
      state: '',
      country: 'Brasil',
      bio_short: '',
      bio_long: '',
      email: '',
      whatsapp: '',
      instagram: '',
      profile_image_url: '',
      profile_image_alt: '',
      cover_image_url: '',
      cover_image_alt: '',
      gallery: [],
      links: {
        instagram: '',
        spotify: '',
        soundcloud: '',
        youtube: '',
        beatport: '',
        website: '',
        portfolio: '',
        facebook: '',
        tiktok: '',
        other: []
      },
      fee_range: 'negociavel',
      availability: {
        days: [],
        times: [],
        cities: []
      },
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
      ...initialData
    }
  });

  return (
    <EntityFormV4
      entityType="artist"
      form={form}
      onSubmit={onSubmit}
      onBack={onBack}
      className={className}
    />
  );
}