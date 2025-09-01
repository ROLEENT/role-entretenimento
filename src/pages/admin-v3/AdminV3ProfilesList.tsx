import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { publicUrlFor } from "@/admin/profiles/adminApi";
import { AdminPageWrapper } from "@/components/ui/admin-page-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ExternalLink, Edit, Plus } from "lucide-react";

export default function AdminV3ProfilesList() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<"all"|"public"|"draft"|"private">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      let query = supabase
        .from("profiles")
        .select("id, name, handle, type, city, visibility, published_at")
        .order("published_at", { ascending: false, nullsFirst: true })
        .limit(200);

      if (q) query = query.ilike("name", `%${q}%`);
      if (visibility !== "all") query = query.eq("visibility", visibility);

      const { data } = await query;
      if (mounted) {
        setItems(data ?? []);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [q, visibility]);

  const breadcrumbs = [
    { label: "Perfis" }
  ];

  const actions = (
    <Button asChild>
      <Link to="/admin-v3/perfis/criar">
        <Plus className="h-4 w-4 mr-2" />
        Novo Perfil
      </Link>
    </Button>
  );

  return (
    <AdminPageWrapper
      title="Perfis"
      description="Gerencie perfis de artistas, organizadores e locais"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Buscar por nome..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="public">Publicados</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="private">Privados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Nome</th>
                  <th className="text-left p-4 font-medium">Handle</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Cidade</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Carregando perfis...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhum perfil encontrado
                    </td>
                  </tr>
                ) : (
                  items.map(profile => (
                    <tr key={profile.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{profile.name}</td>
                      <td className="p-4 text-muted-foreground">@{profile.handle}</td>
                      <td className="p-4 capitalize">{profile.type}</td>
                      <td className="p-4">{profile.city}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.visibility === 'public' ? 'bg-green-100 text-green-800' :
                          profile.visibility === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.visibility}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/admin-v3/perfis/${profile.id}/editar`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Link>
                          </Button>
                          {profile.handle && (
                            <Button asChild variant="outline" size="sm">
                              <a 
                                href={publicUrlFor(profile.handle, profile.visibility) ?? "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Ver
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
}