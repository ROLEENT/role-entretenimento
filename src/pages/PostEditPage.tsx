import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, PostForm } from '@/schemas/post';
import { useUpsertPost } from '@/hooks/useUpsertPost';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import {
  FormShell,
  FormLayout,
  FormSection,
  FORM_SECTIONS,
  RHFInput,
  RHFTextarea,
  RHFSelect,
  RHFSelectAsync,
  RHFSlug,
  RHFUpload,
  RHFMultiSelectAsync,
  RHFRichEditor,
} from '@/components/form';

const statusOptions = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
];

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { upsertPost, loading } = useUpsertPost();
  
  const isEdit = id !== 'novo';

  const form = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      status: 'draft',
      category_id: null,
      tags: [],
      author_id: '00000000-0000-0000-0000-000000000000', // Default admin ID
      excerpt: '',
      content: '',
      cover_url: '',
      seo_title: '',
      seo_description: '',
    },
  });

  // Load existing post data if editing
  useEffect(() => {
    if (isEdit && id) {
      const loadPost = async () => {
        try {
          const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            form.reset({
              id: data.id,
              title: data.title || '',
              slug: data.slug || '',
              status: data.status || 'draft',
              category_id: data.category_ids?.[0] || null,
              tags: data.tags || [],
              author_id: data.author_id || '00000000-0000-0000-0000-000000000000',
              excerpt: data.summary || '',
              content: data.content_html || '',
              cover_url: data.cover_image || '',
              seo_title: data.seo_title || '',
              seo_description: data.seo_description || '',
            });
          }
        } catch (error: any) {
          console.error('Error loading post:', error);
          toast.error('Erro ao carregar post');
          navigate('/admin-v3/revista');
        }
      };

      loadPost();
    }
  }, [id, isEdit, form, navigate]);

  const handleSaveDraft = async (data: PostForm) => {
    await upsertPost({ ...data, status: 'draft' });
  };

  const handlePublish = async (data: PostForm) => {
    await upsertPost({ ...data, status: 'published' });
  };

  const handleSaveAndExit = async (data: PostForm) => {
    await upsertPost(data);
    navigate('/admin-v3/revista');
  };

  return (
    <FormShell
      title={isEdit ? 'Editar Post' : 'Novo Post'}
      description={isEdit ? 'Edite as informações do post' : 'Crie um novo post para a revista'}
      form={form}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      onSaveAndExit={handleSaveAndExit}
      backUrl="/admin-v3/revista"
      isDraft={form.watch('status') === 'draft'}
      isSubmitting={loading}
    >
      <FormLayout>
        <FormSection 
          id={FORM_SECTIONS.BASIC_INFO.id}
          title={FORM_SECTIONS.BASIC_INFO.title}
          description={FORM_SECTIONS.BASIC_INFO.description}
          defaultOpen={true}
        >
          <RHFInput
            name="title"
            label="Título"
            placeholder="Digite o título do post"
          />
          
          <RHFSlug
            name="slug"
            label="Slug"
            table="blog_posts"
            currentId={id !== 'novo' ? id : undefined}
            generateFrom="title"
          />

          <RHFSelect
            name="status"
            options={[
              { value: "draft", label: "Rascunho" },
              { value: "published", label: "Publicado" }
            ]}
            placeholder="Selecione o status"
          />
        </FormSection>

        <FormSection 
          id={FORM_SECTIONS.RELATIONSHIPS.id}
          title={FORM_SECTIONS.RELATIONSHIPS.title}
          description={FORM_SECTIONS.RELATIONSHIPS.description}
        >
          <RHFSelectAsync
            name="category_id"
            label="Categoria"
            query={{ 
              table: "categories", 
              fields: "id,name,slug,kind", 
              orderBy: "name" 
            }}
            mapRow={(r) => ({ 
              value: r.id, 
              label: `${r.name}${r.kind !== 'ambos' ? ` (${r.kind})` : ''}` 
            })}
            parseValue={(v) => Number(v)}
            serializeValue={(v) => String(v ?? "")}
            placeholder="Selecione a categoria"
          />

          <RHFMultiSelectAsync
            name="tags"
            label="Tags"
            query={{ 
              table: "categories", 
              fields: "id,name,slug,kind", 
              orderBy: "name" 
            }}
            mapRow={(r) => ({ 
              value: r.id, 
              label: r.name 
            })}
            parseValue={(v) => Number(v)}
            serializeValue={(v) => String(v ?? "")}
            placeholder="Selecione as tags"
          />
        </FormSection>

        <FormSection 
          id={FORM_SECTIONS.CONTENT.id}
          title={FORM_SECTIONS.CONTENT.title}
          description={FORM_SECTIONS.CONTENT.description}
        >
          <RHFTextarea
            name="excerpt"
            label="Resumo"
            placeholder="Escreva um resumo do post"
            rows={3}
          />

          <RHFRichEditor
            name="content"
            label="Conteúdo"
            placeholder="Escreva o conteúdo completo do post"
            rows={15}
          />
        </FormSection>

        <FormSection 
          id={FORM_SECTIONS.MEDIA.id}
          title={FORM_SECTIONS.MEDIA.title}
          description={FORM_SECTIONS.MEDIA.description}
        >
          <RHFUpload
            name="cover_url"
            label="Imagem de Capa"
            bucket="blog-covers"
          />
        </FormSection>

        <FormSection 
          id={FORM_SECTIONS.SEO.id}
          title={FORM_SECTIONS.SEO.title}
          description={FORM_SECTIONS.SEO.description}
        >
          <RHFInput
            name="seo_title"
            label="Título SEO"
            placeholder="Título otimizado para SEO"
          />
          
          <RHFTextarea
            name="seo_description"
            label="Descrição SEO"
            placeholder="Descrição otimizada para SEO"
            rows={3}
          />
        </FormSection>
      </FormLayout>
    </FormShell>
  );
}