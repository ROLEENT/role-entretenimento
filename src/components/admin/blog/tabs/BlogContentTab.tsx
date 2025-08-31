import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFTextarea } from '@/components/form';
import { BlogPostForm } from '@/hooks/useUpsertBlogPost';
import { FileText, Code } from 'lucide-react';

interface BlogContentTabProps {
  form: UseFormReturn<BlogPostForm>;
}

export const BlogContentTab: React.FC<BlogContentTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Conteúdo Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="content_html"
            label="Conteúdo HTML *"
            placeholder="<p>Escreva o conteúdo do post aqui...</p>"
            rows={15}
            className="font-mono text-sm"
          />
          
          <div className="text-xs text-muted-foreground">
            <p>💡 Dica: Use HTML para formatação avançada. Tags suportadas: p, h1-h6, strong, em, ul, ol, li, a, img, blockquote.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Markdown (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="content_md"
            label="Conteúdo Markdown"
            placeholder="# Título\n\nEscreva o conteúdo em Markdown para backup/exportação..."
            rows={10}
            className="font-mono text-sm"
          />
          
          <div className="text-xs text-muted-foreground">
            <p>📝 Campo opcional: Usado para backup, exportação e compatibilidade com outros sistemas.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};