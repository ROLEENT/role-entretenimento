import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RHFInput from '@/components/form/RHFInput';
import { RHFSlugInput } from '@/components/form/RHFSlugInput';
import { RHFSelect } from '@/components/form/RHFSelect';
import RHFTextarea from '@/components/form/RHFTextarea';
import { ChipInput } from '@/components/form/ChipInput';
import { CharacterCounter } from '@/components/form/CharacterCounter';
import { SlugGenerator } from '@/components/form/SlugGenerator';
import { RHFEventSeriesSelect } from '@/components/rhf/RHFEventSeriesSelect';
import { useEventSlugCheck } from '@/hooks/useEventSlugCheck';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { EventFormV3 } from '@/schemas/event-v3';

interface EventBasicInfoTabProps {
  eventId?: string;
  isPending: boolean;
}

export function EventBasicInfoTab({ eventId, isPending }: EventBasicInfoTabProps) {
  const form = useFormContext<EventFormV3>();
  const { setValue, watch } = form;
  const formData = watch();

  const { isCheckingSlug, slugStatus } = useEventSlugCheck({
    slug: formData.slug || '',
    eventId,
    enabled: !!formData.slug
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFInput
            name="title"
            label="Título do Evento"
            placeholder="Nome do evento"
            disabled={isPending}
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <RHFSlugInput
                  name="slug"
                  label="Slug (URL)"
                  placeholder="nome-do-evento"
                  disabled={isPending}
                />
              </div>
              <SlugGenerator
                title={formData.title}
                onGenerate={(slug) => setValue('slug', slug)}
                disabled={isPending}
              />
            </div>
            {slugStatus && (
              <div className="flex items-center gap-2 text-sm">
                {isCheckingSlug ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : slugStatus === 'available' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={slugStatus === 'available' ? 'text-green-600' : 'text-red-600'}>
                  {slugStatus === 'available' ? 'Slug disponível' : 'Slug já está em uso'}
                </span>
              </div>
            )}
          </div>

          <RHFInput
            name="city"
            label="Cidade"
            placeholder="São Paulo"
            disabled={isPending}
          />

          <RHFSelect
            name="highlight_type"
            label="Tipo de Destaque"
            options={[
              { value: 'none', label: 'Nenhum' },
              { value: 'featured', label: 'Curatorial' },
              { value: 'vitrine', label: 'Vitrine' }
            ]}
            disabled={isPending}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <ChipInput
              name="tags"
              value={formData.tags}
              onChange={(value) => setValue('tags', value)}
              placeholder="Adicionar tag"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gêneros Musicais</label>
            <ChipInput
              name="genres"
              value={formData.genres}
              onChange={(value) => setValue('genres', value)}
              placeholder="Adicionar gênero"
              disabled={isPending}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Resumo</label>
              <RHFTextarea
                name="description"
                placeholder="Descreva o evento"
                disabled={isPending}
              />
              <CharacterCounter 
                current={formData.description?.length || 0} 
                max={500} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Série e Edições</CardTitle>
        </CardHeader>
        <CardContent>
          <RHFEventSeriesSelect
            seriesControl={{ name: "series_id", control: form.control }}
            editionControl={{ name: "edition_number", control: form.control }}
            description="Séries facilitam a organização de eventos recorrentes como festivais anuais"
          />
        </CardContent>
      </Card>
    </div>
  );
}