import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogPostForm } from '@/hooks/useUpsertBlogPost';
import { BlogBasicTab } from './tabs/BlogBasicTab';
import { BlogContentTab } from './tabs/BlogContentTab';
import { BlogMediaTab } from './tabs/BlogMediaTab';
import { BlogSEOTab } from './tabs/BlogSEOTab';
import { BlogSettingsTab } from './tabs/BlogSettingsTab';

interface AdminBlogFormProps {
  form: UseFormReturn<BlogPostForm>;
}

export const AdminBlogForm: React.FC<AdminBlogFormProps> = ({ form }) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="content">Conteúdo</TabsTrigger>
        <TabsTrigger value="media">Mídia</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="basic" className="space-y-6">
          <BlogBasicTab form={form} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <BlogContentTab form={form} />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <BlogMediaTab form={form} />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <BlogSEOTab form={form} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <BlogSettingsTab form={form} />
        </TabsContent>
      </div>
    </Tabs>
  );
};