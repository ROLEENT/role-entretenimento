import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFInput, RHFTextarea } from '@/components/form';
import { BlogPostForm } from '@/hooks/useUpsertBlogPost';
import { Search, Globe } from 'lucide-react';

interface BlogSEOTabProps {
  form: UseFormReturn<BlogPostForm>;
}

export const BlogSEOTab: React.FC<BlogSEOTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Otimização para Buscadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFInput
            name="seo_title"
            label="Título SEO"
            placeholder="Título otimizado para mecanismos de busca (60 caracteres)"
          />
          
          <RHFTextarea
            name="seo_description"
            label="Descrição SEO"
            placeholder="Descrição que aparece nos resultados de busca (160 caracteres)"
            rows={3}
          />
          
          <div className="text-xs text-muted-foreground space-y-2">
            <p><strong>Dicas de SEO:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use palavras-chave relevantes no título e descrição</li>
              <li>Mantenha títulos entre 50-60 caracteres</li>
              <li>Descrições devem ter entre 120-160 caracteres</li>
              <li>Evite duplicação de conteúdo</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Compartilhamento Social
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Preview do Compartilhamento</h4>
            <div className="border rounded p-3 bg-background">
              <div className="text-sm font-medium line-clamp-1">
                {/* form.watch('seo_title') || form.watch('title') || 'Título do Post' */}
                Título do Post
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {/* form.watch('seo_description') || form.watch('summary') || 'Descrição do post...' */}
                Descrição do post...
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                revista.role.com.br
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};