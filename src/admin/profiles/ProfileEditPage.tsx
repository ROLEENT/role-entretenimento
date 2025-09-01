import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileEditorHeader from "./ProfileEditorHeader";
import ProfileForm from "@/features/profiles/ProfileForm";
import { toast } from "sonner";

type Profile = {
  id: string;
  handle: string;
  visibility: "public" | "draft" | "private";
  name: string;
  type: string;
  city: string;
  state: string;
  country: string;
  bio_short?: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  tags?: string[];
  // ... outros campos
};

export default function ProfileEditPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState<"public" | "draft" | "private">("draft");

  useEffect(() => {
    if (!id) return;
    
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from("entity_profiles")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
        setVisibility(data.visibility as "public" | "draft" | "private");
      } catch (error: any) {
        console.error("Error loading profile:", error);
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Perfil não encontrado</h1>
          <p className="text-gray-600 mt-2">O perfil que você está procurando não existe.</p>
        </div>
      </main>
    );
  }

  const handleProfileSaved = (savedProfile: any) => {
    setVisibility(savedProfile.visibility);
    setProfile({ ...profile, ...savedProfile });
  };

  return (
    <main className="p-6 grid gap-6">
      <ProfileEditorHeader
        id={profile.id}
        handle={profile.handle}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        avatar_url={profile.avatar_url}
        cover_url={profile.cover_url}
        city={profile.city}
        state={profile.state}
      />

      {/* TODO: Criar formulário de edição que aceita initialValues */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">
          Formulário de edição será implementado aqui. 
          O campo "Visibilidade" foi movido para o header acima.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Perfil: {profile.name} (@{profile.handle})
        </p>
      </div>
    </main>
  );
}