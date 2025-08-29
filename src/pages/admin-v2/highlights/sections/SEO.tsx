import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { HighlightForm } from '@/schemas/highlight';
import { Search } from 'lucide-react';

interface SEOSectionProps {
  form: UseFormReturn<HighlightForm>;
}

export function SEOSection({ form }: SEOSectionProps) {
  const title = form.watch('title');
  const metaTitle = form.watch('meta_title');
  const metaDescription = form.watch('meta_description');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO & Meta Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder={title ? `${title} | ROLE` : "Título personalizado para SEO"}
                  {...field} 
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                <span>Título que aparece nos resultados de busca</span>
                <span className={`text-sm ${(metaTitle?.length || 0) > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {metaTitle?.length || 0}/60
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição que aparece nos resultados de busca"
                  className="min-h-20 resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                <span>Resumo atrativo para os mecanismos de busca</span>
                <span className={`text-sm ${(metaDescription?.length || 0) > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {metaDescription?.length || 0}/160
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="noindex"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">No Index</FormLabel>
                <FormDescription>
                  Impedir indexação por mecanismos de busca
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Preview do resultado de busca */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="text-sm font-medium mb-2">Preview nos Resultados de Busca</h4>
          <div className="space-y-1">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
              {metaTitle || title || 'Título do destaque'}
            </div>
            <div className="text-green-700 text-sm">
              role.com.br/destaques/{form.watch('slug') || 'slug-do-destaque'}
            </div>
            <div className="text-gray-600 text-sm">
              {metaDescription || form.watch('summary') || 'Descrição não definida...'}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}