import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageWrapper } from "@/components/ui/admin-page-wrapper";
import ProfileEditorHeader from "@/admin/profiles/ProfileEditorHeader";
import { Skeleton } from "@/components/ui/skeleton";

type Profile = {
  id: string;
  handle?: string;
  visibility: "public"|"draft"|"private";
  name?: string;
  type?: string;
  city?: string;
  state?: string;
  avatar_url?: string;
  cover_url?: string;
  bio_short?: string;
  bio?: string;
  tags?: string[];
  verified?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
};

export default function AdminV3ProfileEdit() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState<"public"|"draft"|"private">("draft");

  useEffect(() => {
    if (!id) return;
    
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (mounted) {
        if (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } else {
          setProfile(data);
          setVisibility(data.visibility || "draft");
        }
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleProfileSaved = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <AdminPageWrapper
        title="Carregando..."
        breadcrumbs={[
          { label: "Perfis", path: "/admin-v3/perfis" },
          { label: "Editando..." }
        ]}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="grid gap-4">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </AdminPageWrapper>
    );
  }

  if (!profile) {
    return (
      <AdminPageWrapper
        title="Perfil não encontrado"
        breadcrumbs={[
          { label: "Perfis", path: "/admin-v3/perfis" },
          { label: "Erro" }
        ]}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground">O perfil solicitado não foi encontrado.</p>
        </div>
      </AdminPageWrapper>
    );
  }

  const breadcrumbs = [
    { label: "Perfis", path: "/admin-v3/perfis" },
    { label: profile.name || "Perfil" }
  ];

  return (
    <AdminPageWrapper
      title={`Editando: ${profile.name || 'Perfil'}`}
      description="Gerencie as informações e visibilidade do perfil"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
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

        <div className="border rounded-lg p-6 bg-muted/50">
          <h3 className="text-lg font-medium mb-4">Formulário de Edição</h3>
          <p className="text-muted-foreground">
            TODO: Implementar formulário completo de edição de perfil com todos os campos necessários.
          </p>
        </div>
      </div>
    </AdminPageWrapper>
  );
}