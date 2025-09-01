import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFInput, RHFSelect } from '@/components/form';
import { BlogPostForm } from '@/hooks/useUpsertBlogPost';
import { Settings, Calendar, Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface BlogSettingsTabProps {
  form: UseFormReturn<BlogPostForm>;
}

export const BlogSettingsTab: React.FC<BlogSettingsTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status de Publicação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status *</label>
              <select 
                className="w-full p-2 border rounded-md"
                {...form.register('status')}
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="scheduled">Agendado</option>
              </select>
            </div>
            
            <RHFInput
              name="author_id"
              label="ID do Autor"
              placeholder="UUID do autor"
              type="hidden"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="featured"
              {...form.register('featured')}
            />
            <label 
              htmlFor="featured" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Post em destaque
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              name="published_at"
              label="Data de Publicação"
              type="datetime-local"
            />
            
            <RHFInput
              name="scheduled_at"
              label="Agendar Para"
              type="datetime-local"
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Sobre agendamento:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
              <li>Posts agendados são publicados automaticamente na data/hora especificada</li>
              <li>A data de publicação define quando o post aparece publicamente</li>
              <li>Deixe em branco para publicação imediata</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};