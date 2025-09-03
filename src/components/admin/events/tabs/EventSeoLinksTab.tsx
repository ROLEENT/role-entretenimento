import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RHFInput from '@/components/form/RHFInput';
import RHFTextarea from '@/components/form/RHFTextarea';
import { RHFImageUpload } from '@/components/rhf/RHFImageUpload';
import { LinksEditor } from '@/components/form/LinksEditor';
import { CharacterCounter } from '@/components/form/CharacterCounter';
import { EventFormV3 } from '@/schemas/event-v3';

interface EventSeoLinksTabProps {
  isPending: boolean;
}

export function EventSeoLinksTab({ isPending }: EventSeoLinksTabProps) {
  const form = useFormContext<EventFormV3>();
  const { setValue, watch } = form;
  const formData = watch();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <RHFInput
              name="seo_title"
              label="Título SEO"
              placeholder="Título otimizado para buscadores"
              disabled={isPending}
            />
            <CharacterCounter 
              current={formData.seo_title?.length || 0} 
              max={60} 
            />
          </div>

          <div className="space-y-2">
            <RHFTextarea
              name="seo_description"
              label="Descrição SEO"
              placeholder="Descrição otimizada para buscadores"
              disabled={isPending}
            />
            <CharacterCounter 
              current={formData.seo_description?.length || 0} 
              max={160} 
            />
          </div>

          <RHFImageUpload
            urlControl={{ name: "og_image_url", control: form.control }}
            altControl={{ name: "og_image_alt", control: form.control }}
            label="Imagem Open Graph"
            description="Imagem que aparece quando o evento é compartilhado nas redes sociais (1200x630px)"
            showPreview={true}
            showAltText={false}
            maxSize={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links e Vídeo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFInput
            name="video_url"
            label="URL do Vídeo"
            placeholder="https://youtube.com/watch?v=..."
            disabled={isPending}
          />

          <LinksEditor
            value={formData.links || {}}
            onChange={(value) => setValue('links', value)}
            disabled={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}