import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { AdminV3Guard } from "@/components/AdminV3Guard";
import { AdminV3Header } from "@/components/AdminV3Header";
import { AdminV3Breadcrumb } from "@/components/AdminV3Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentesArtistsList } from "@/components/agentes/AgentesArtistsList";
import { AgentesOrganizadoresList } from "@/components/agentes/AgentesOrganizadoresList";
import { AgentesLocaisList } from "@/components/agentes/AgentesLocaisList";

export default function AdminV3Agentes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Determinar aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/artistas')) return 'artistas';
    if (path.includes('/organizadores')) return 'organizadores';
    if (path.includes('/locais')) return 'locais';
    return 'artistas'; // default
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    navigate(`/admin-v3/agentes/${value}`);
  };

  const getNewButtonLink = () => {
    return `/admin-v3/agentes/${activeTab}/new`;
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'artistas': return 'Artistas';
      case 'organizadores': return 'Organizadores';
      case 'locais': return 'Locais';
      default: return 'Artistas';
    }
  };

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-6">
            <AdminV3Breadcrumb 
              items={[
                { label: "Dashboard", path: "/admin-v3" },
                { label: "Agentes", path: "/admin-v3/agentes" },
                { label: getTabTitle() }
              ]} 
            />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Agentes</h1>
                <p className="text-muted-foreground">
                  Gerencie artistas, organizadores e locais da plataforma
                </p>
              </div>
              <Button asChild>
                <Link to={getNewButtonLink()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo {getTabTitle().slice(0, -1)}
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gerenciar {getTabTitle()}</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={`Buscar ${getTabTitle().toLowerCase()}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="artistas">Artistas</TabsTrigger>
                    <TabsTrigger value="organizadores">Organizadores</TabsTrigger>
                    <TabsTrigger value="locais">Locais</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="artistas" className="mt-6">
                    <AgentesArtistsList search={search} />
                  </TabsContent>
                  
                  <TabsContent value="organizadores" className="mt-6">
                    <AgentesOrganizadoresList search={search} />
                  </TabsContent>
                  
                  <TabsContent value="locais" className="mt-6">
                    <AgentesLocaisList search={search} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}