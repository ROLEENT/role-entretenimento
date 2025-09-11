import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrganizerEnhancedForm } from "@/schemas/entities/organizer-enhanced";

// FASE 2: Hook refatorado com logs detalhados e mapper correto
export const useUpsertOrganizerFixed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrganizerEnhancedForm) => {
      console.log("=== UPSERT ORGANIZER DEBUG START ===");
      console.log("1. Raw form data received:", JSON.stringify(data, null, 2));

      // Generate slug if not provided
      const generateSlug = (text: string) => {
        const slug = text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
          .trim()
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
          .slice(0, 80); // Limit to 80 chars
        console.log(`2. Generated slug: "${slug}" from "${text}"`);
        return slug;
      };

      // Helper to convert empty strings to null
      const toNull = (value: any) => {
        if (value === '' || value === undefined) return null;
        return value;
      };

      // FASE 2: Mapper completo baseado nas colunas reais da tabela
      const organizerData = {
        id: data.id || undefined,
        name: data.name, // Required field
        slug: data.slug || generateSlug(data.name),
        contact_email: toNull(data.email),
        site: toNull(data.website),
        instagram: toNull(data.instagram),
        site_url: toNull(data.website),
        email: toNull(data.email),
        phone: toNull(data.phone),
        city_id: null, // Not mapped from enhanced form
        contact_whatsapp: toNull(data.whatsapp),
        bio_short: toNull(data.bio_short),
        status: data.status || 'active',
        type: data.type || 'organizador',
        booking_email: toNull(data.booking_contact?.email),
        booking_whatsapp: toNull(data.booking_contact?.whatsapp),
        whatsapp: toNull(data.whatsapp),
        website: toNull(data.website),
        city: toNull(data.city),
        state: toNull(data.state),
        country: data.country || 'BR',
        about: toNull(data.about || data.manifesto),
        invoice_name: toNull(data.business_info?.legal_name),
        tax_id: toNull(data.business_info?.tax_id),
        invoice_email: toNull(data.email),
        pix_key: toNull(data.payment_info?.pix_key),
        bank: data.payment_info || {},
        links: {
          website: toNull(data.website),
          instagram: toNull(data.links?.instagram || data.instagram),
          facebook: toNull(data.links?.facebook),
          linkedin: toNull(data.links?.linkedin),
          youtube: toNull(data.links?.youtube),
          ...data.links?.other?.reduce((acc, link) => ({ 
            ...acc, 
            [link.label]: link.url 
          }), {}) || {}
        },
        avatar_url: toNull(data.logo_url),
        avatar_alt: toNull(data.logo_alt),
        bio: toNull(data.manifesto || data.about),
        cover_url: toNull(data.cover_url),
        cover_alt: toNull(data.cover_alt),
        logo_alt: toNull(data.logo_alt),
        is_active: data.status === 'published'
      };

      console.log("3. Mapped organizer data:", JSON.stringify(organizerData, null, 2));

      // FASE 2: Configurar headers de admin para RLS
      const headers: Record<string, string> = {};
      
      // Tentar obter email de admin do contexto (seria implementado no adminClient)
      const adminEmail = 'admin@system.local'; // Placeholder - seria dinâmico
      if (adminEmail) {
        headers['x-admin-email'] = adminEmail;
        console.log("4. Using admin headers:", headers);
      }

      try {
        console.log("5. Attempting upsert to organizers table...");
        
        const { data: result, error } = await supabase
          .from("organizers")
          .upsert(organizerData, { 
            onConflict: data.id ? "id" : "slug",
            ignoreDuplicates: false 
          })
          .select("*")
          .single();

        if (error) {
          console.error("6. UPSERT ERROR:");
          console.error("   - Error code:", error.code);
          console.error("   - Error message:", error.message);
          console.error("   - Error details:", error.details);
          console.error("   - Error hint:", error.hint);
          console.error("   - Sent payload:", JSON.stringify(organizerData, null, 2));
          
          throw new Error(`Erro ao salvar organizador: ${error.message}`);
        }

        console.log("7. SUCCESS - Organizer saved:", result);
        console.log("=== UPSERT ORGANIZER DEBUG END ===");
        
        return result;
      } catch (dbError: any) {
        console.error("8. CATCH BLOCK ERROR:");
        console.error("   - Error type:", typeof dbError);
        console.error("   - Error message:", dbError.message);
        console.error("   - Full error:", dbError);
        console.log("=== UPSERT ORGANIZER DEBUG END (ERROR) ===");
        
        throw dbError;
      }
    },
    onSuccess: (data) => {
      console.log("✅ Mutation onSuccess triggered:", data);
      queryClient.invalidateQueries({ queryKey: ["organizers"] });
      queryClient.invalidateQueries({ queryKey: ["organizer", data.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
      toast.success("Organizador salvo com sucesso!");
    },
    onError: (error: any) => {
      console.error("❌ Mutation onError triggered:");
      console.error("   - Error message:", error.message);
      console.error("   - Full error object:", error);
      
      // FASE 4: Error handling melhorado
      const errorMessage = error?.message || "Erro desconhecido ao salvar organizador";
      toast.error(`Erro: ${errorMessage}`);
    },
  });
};