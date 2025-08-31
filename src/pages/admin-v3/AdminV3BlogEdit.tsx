import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminGuard } from '@/components/layouts/AdminGuard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { FormShell } from '@/components/form';
import { Form } from '@/components/ui/form';
import { AdminV3Breadcrumb } from '@/components/admin/common/AdminV3Breadcrumb';
import { AdminBlogForm } from '@/components/admin/blog/AdminBlogForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BlogPostForm, useUpsertBlogPost } from '@/hooks/useUpsertBlogPost';

const blogPostSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  summary: z.string().min(1, 'Resumo é obrigatório'),
  content_html: z.string().min(1, 'Conteúdo é obrigatório'),
  content_md: z.string().optional(),
  cover_image: z.string().min(1, 'Imagem de capa é obrigatória'),
  cover_alt: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  author_name: z.string().min(1, 'Nome do autor é obrigatório'),
  author_id: z.string(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  status: z.enum(['draft', 'published', 'scheduled']),
  featured: z.boolean(),
  category_ids: z.array(z.string()),
  tags: z.array(z.string()),
  published_at: z.string().optional(),
  scheduled_at: z.string().optional(),
});

const AdminV3BlogEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const upsertBlogPost = useUpsertBlogPost();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do post é obrigatório');
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        throw new Error('Erro ao carregar post');
      }

      return data;
    },
    enabled: !!id,
  });

  const form = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      content_html: '',
      content_md: '',
      cover_image: '',
      cover_alt: '',
      seo_title: '',
      seo_description: '',
      author_name: '',
      author_id: '',
      city: '',
      status: 'draft',
      featured: false,
      category_ids: [],
      tags: [],
      published_at: '',
      scheduled_at: '',
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        ...post,
        category_ids: post.category_ids || [],
        tags: post.tags || [],
        published_at: post.published_at || '',
        scheduled_at: post.scheduled_at || '',
      });
    }
  }, [post, form]);

  const handleSaveAndExit = async (data: BlogPostForm) => {
    try {
      await upsertBlogPost.mutateAsync({ ...data, id });
      navigate('/admin-v3/revista');
    } catch (error) {
      console.error('Error updating blog post:', error);
    }
  };

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Revista', path: '/admin-v3/revista' },
    { label: post?.title || 'Editando...' },
  ];

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminV3Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-64">
            <LoadingSpinner />
          </div>
        </main>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminV3Header />
      <main className="container mx-auto px-4 py-8">
        <AdminV3Breadcrumb items={breadcrumbs} />
        
        <Form {...form}>
          <FormShell
            title={`Editar Post: ${post?.title}`}
            description="Atualize o conteúdo do post"
            form={form}
            onSaveAndExit={handleSaveAndExit}
            backUrl="/admin-v3/revista"
            isSubmitting={upsertBlogPost.isPending}
          >
            <AdminBlogForm form={form} />
          </FormShell>
        </Form>
      </main>
    </AdminGuard>
  );
};

export default AdminV3BlogEdit;