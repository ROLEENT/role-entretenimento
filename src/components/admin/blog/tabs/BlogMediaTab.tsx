import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFUpload, RHFInput } from '@/components/form';
import { BlogPostForm } from '@/hooks/useUpsertBlogPost';
import { Camera, Image } from 'lucide-react';

interface BlogMediaTabProps {
  form: UseFormReturn<BlogPostForm>;
}

export const BlogMediaTab: React.FC<BlogMediaTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Imagem de Capa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFUpload
            name="cover_image"
            label="Imagem de Capa *"
            bucket="blog-posts"
          />
          
          <RHFInput
            name="cover_alt"
            label="Texto Alternativo"
            placeholder="Descrição da imagem para acessibilidade"
          />
          
          <div className="text-xs text-muted-foreground">
            <p>📐 Dimensões recomendadas: 1200x630px (ratio 16:9) para melhor compatibilidade com redes sociais.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Dicas de Mídia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use imagens de alta qualidade (mínimo 1200px de largura)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Formatos suportados: JPG, PNG, WebP</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Mantenha o tamanho do arquivo abaixo de 2MB para carregamento rápido</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>O texto alternativo é importante para acessibilidade e SEO</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};