import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { venueEnhancedSchema, VenueEnhancedForm } from '@/schemas/entities/venue-enhanced';
import { EntityFormV4 } from '../EntityFormV4';

interface VenueFormV4Props {
  initialData?: Partial<VenueEnhancedForm>;
  onSubmit?: (data: any) => void;
  onBack?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function VenueFormV4({
  initialData,
  onSubmit,
  onBack,
  isLoading,
  className
}: VenueFormV4Props) {
  const form = useForm<VenueEnhancedForm>({
    resolver: zodResolver(venueEnhancedSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: 'bar',
      address_line: '',
      district: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Brasil',
      latitude: 0,
      longitude: 0,
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
      capacity: 0,
      opening_hours: {
        monday: { open: '', close: '' },
        tuesday: { open: '', close: '' },
        wednesday: { open: '', close: '' },
        thursday: { open: '', close: '' },
        friday: { open: '', close: '' },
        saturday: { open: '', close: '' },
        sunday: { open: '', close: '' }
      },
      bar_style: [],
      ambient_type: [],
      drink_specialties: [],
      stage_type: '',
      seating_capacity: 0,
      acoustic_treatment: false,
      technical_equipment: [],
      dance_floor_size: 0,
      sound_system: '',
      lighting_system: '',
      vip_areas: false,
      cuisine_type: [],
      price_range: 'medio',
      dining_style: [],
      outdoor_seating: false,
      music_genres: [],
      show_structure: {
        stage: false,
        backstage: false,
        green_room: false,
        load_in: ''
      },
      features: {
        parking: false,
        wifi: false,
        air_conditioning: false,
        accessibility: false,
        security: false,
        coat_check: false,
        outdoor_area: false,
        private_events: false
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
      tags: [],
      ...initialData
    }
  });

  return (
    <EntityFormV4
      entityType="venue"
      form={form}
      onSubmit={onSubmit}
      onBack={onBack}
      className={className}
    />
  );
}