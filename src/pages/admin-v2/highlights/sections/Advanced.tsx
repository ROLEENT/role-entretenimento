import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HighlightForm } from '@/schemas/highlight';
import { toast } from 'sonner';
import { Settings, Tag, Plus, X } from 'lucide-react';

interface AdvancedSectionProps {
  form: UseFormReturn<HighlightForm>;
}

export function AdvancedSection({ form }: AdvancedSectionProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    
    const currentTags = form.getValues('tags') || [];
    
    if (currentTags.includes(trimmedTag)) {
      toast.error('Tag já existe');
      return;
    }
    
    if (currentTags.length >= 6) {
      toast.error('Máximo de 6 tags');
      return;
    }
    
    if (trimmedTag.length > 24) {
      toast.error('Tag deve ter no máximo 24 caracteres');
      return;
    }

    form.setValue('tags', [...currentTags, trimmedTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const tags = form.watch('tags') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações Avançadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4">
          <FormLabel className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </FormLabel>
          
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar tag... (máx 24 chars)"
              value={newTag}
              maxLength={24}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={tags.length >= 6}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addTag}
              disabled={!newTag.trim() || tags.length >= 6}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <FormDescription>
            Tags ajudam na organização e busca. Máximo 6 tags de até 24 caracteres cada.
          </FormDescription>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="created_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Criado por</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ID do usuário criador"
                    {...field} 
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>
                  Preenchido automaticamente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="updated_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Atualizado por</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ID do último editor"
                    {...field} 
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>
                  Atualizado automaticamente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.watch('updated_at') && (
          <div className="text-sm text-muted-foreground">
            Última atualização: {new Date(form.watch('updated_at')!).toLocaleString()}
          </div>
        )}

      </CardContent>
    </Card>
  );
}