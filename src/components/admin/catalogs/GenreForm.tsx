import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateGenre, useUpdateGenre, Genre } from '@/hooks/useGenres';

const genreSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  is_active: z.boolean().default(true),
});

type GenreFormData = z.infer<typeof genreSchema>;

interface GenreFormProps {
  genre?: Genre | null;
  onClose: () => void;
}

export function GenreForm({ genre, onClose }: GenreFormProps) {
  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();

  const form = useForm<GenreFormData>({
    resolver: zodResolver(genreSchema),
    defaultValues: {
      name: genre?.name || '',
      is_active: genre?.is_active ?? true,
    },
  });

  const onSubmit = async (data: GenreFormData) => {
    try {
      if (genre) {
        await updateGenre.mutateAsync({
          id: genre.id,
          name: data.name,
          is_active: data.is_active,
        });
      } else {
        await createGenre.mutateAsync(data.name);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutations
    }
  };

  const isLoading = createGenre.isPending || updateGenre.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Gênero</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: House, Techno, Hip Hop..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {genre && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Ativo</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Gêneros inativos ficam ocultos na seleção de artistas.
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : genre ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}