import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrganizerFormDataV2, generateSlugFromName } from '@/lib/organizerSchemaV2';

export const useCreateOrganizerV2 = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrganizerFormDataV2) => {
      console.log('Criando organizador V2:', data);

      // Gerar slug único
      let slug = data.slug || generateSlugFromName(data.name);
      
      // Verificar se slug já existe
      const { data: existingOrganizer } = await supabase
        .from('organizers')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingOrganizer) {
        slug = `${slug}-${Date.now()}`;
      }

      // Mapear dados para a estrutura da tabela organizers
      const organizerData = {
        name: data.name,
        slug: slug,
        type: data.type || null,
        city: data.city || null,
        contact_email: data.contact_email || null,
        contact_whatsapp: data.contact_whatsapp || null,
        instagram: data.instagram || null,
        site: data.website || null,
        bio: data.bio || null,
        bio_short: data.bio_short || null,
        status: data.status || 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Dados finais para inserção:', organizerData);

      // Inserir no banco
      const { data: result, error } = await supabase
        .from('organizers')
        .insert(organizerData)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado:', error);
        throw new Error(`Erro ao criar organizador: ${error.message}`);
      }

      return result;
    },
    onSuccess: (result) => {
      toast({
        title: 'Sucesso!',
        description: 'Organizador criado com sucesso',
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['organizers'] });
      
      return result;
    },
    onError: (error: Error) => {
      console.error('Erro ao criar organizador:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};