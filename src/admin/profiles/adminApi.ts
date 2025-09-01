import { supabase } from "@/integrations/supabase/client";

export type Visibility = "public"|"draft"|"private";

export async function setProfileVisibility(id: string, visibility: Visibility) {
  const { error } = await supabase
    .from("profiles")
    .update({ visibility })
    .eq("id", id);
  if (error) throw error;
}

export function publicUrlFor(handle?: string, visibility?: Visibility) {
  if (!handle) return null;
  const url = `/perfil/${handle.toLowerCase()}`;
  return visibility === "public" ? url : url; // habilitar sempre, mas mostrar aviso se não for public
}