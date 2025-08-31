import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFInput, RHFTextarea, RHFSelect, RHFSelectAsync } from '@/components/form';
import { BlogPostForm } from '@/hooks/useUpsertBlogPost';
import { FileText, User, MapPin } from 'lucide-react';

interface BlogBasicTabProps {
  form: UseFormReturn<BlogPostForm>;
}

export const BlogBasicTab: React.FC<BlogBasicTabProps> = ({ form }) => {
  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !value.slug) {
        const slug = value.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
        form.setValue('slug', slug);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              name="title"
              label="Título do Post *"
              placeholder="Ex: Entrevista exclusiva com..."
            />
            
            <RHFInput
              name="slug"
              label="Slug (URL)"
              placeholder="entrevista-exclusiva-com"
            />
          </div>

          <RHFTextarea
            name="summary"
            label="Resumo *"
            placeholder="Breve descrição do post que aparecerá nos cards e compartilhamentos"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              name="author_name"
              label="Nome do Autor *"
              placeholder="Nome completo do autor"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <RHFInput
                name="tags"
                placeholder="Ex: música, cultura, entrevista"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Separe as tags com vírgulas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização e Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFSelect
              name="city"
              label="Cidade *"
              placeholder="Selecione a cidade"
              options={[
                { value: 'poa', label: 'Porto Alegre' },
                { value: 'sp', label: 'São Paulo' },
                { value: 'rj', label: 'Rio de Janeiro' },
                { value: 'curitiba', label: 'Curitiba' },
                { value: 'floripa', label: 'Florianópolis' }
              ]}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categorias</label>
              <RHFSelectAsync
                name="category_ids"
                query={{ 
                  table: "categories", 
                  fields: "id,name,slug,kind,color", 
                  orderBy: "name",
                  filter: "kind=eq.revista,is_active=eq.true"
                }}
                mapRow={(r) => ({ 
                  value: r.id, 
                  label: r.name
                })}
                placeholder="Selecione as seções da revista"
                multiple={true}
              />
              <p className="text-xs text-muted-foreground">
                Categorias relacionadas ao conteúdo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};