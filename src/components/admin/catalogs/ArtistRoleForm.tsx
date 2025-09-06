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
import { useCreateArtistRole, useUpdateArtistRole, ArtistRole } from '@/hooks/useArtistRoles';

const roleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  is_active: z.boolean().default(true),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface ArtistRoleFormProps {
  role?: ArtistRole | null;
  onClose: () => void;
}

export function ArtistRoleForm({ role, onClose }: ArtistRoleFormProps) {
  const createRole = useCreateArtistRole();
  const updateRole = useUpdateArtistRole();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      is_active: role?.is_active ?? true,
    },
  });

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (role) {
        await updateRole.mutateAsync({
          id: role.id,
          name: data.name,
          is_active: data.is_active,
        });
      } else {
        await createRole.mutateAsync(data.name);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutations
    }
  };

  const isLoading = createRole.isPending || updateRole.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Função</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: DJ, Produtor, Designer..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {role && (
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
                    Funções inativas ficam ocultas na seleção de artistas.
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
            {isLoading ? 'Salvando...' : role ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}