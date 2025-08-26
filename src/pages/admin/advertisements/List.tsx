import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function AdvertisementsList() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anúncios</h1>
          <p className="text-muted-foreground">
            Gerencie anúncios e banners promocionais
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/advertisements/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Anúncio
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Anúncios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por título, anunciante ou posição..."
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                  Banner
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Banner Home - Festival de Inverno</h3>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Anunciante: Festival Cultural • Posição: Topo da página inicial
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Válido até: 31/03/2024 • Cliques: 1,245 • CTR: 2.3%
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/advertisements/1/edit">
                    <Edit className="h-3 w-3" />
                  </Link>
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                  Banner
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Sidebar - Casa Noturna Premium</h3>
                    <Badge variant="secondary">Pausado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Anunciante: Night Club XYZ • Posição: Sidebar eventos
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Válido até: 15/02/2024 • Cliques: 892 • CTR: 1.8%
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <EyeOff className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/advertisements/2/edit">
                    <Edit className="h-3 w-3" />
                  </Link>
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                  Banner
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Footer - App de Música</h3>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Anunciante: StreamMusic • Posição: Footer todas as páginas
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Válido até: 30/04/2024 • Cliques: 567 • CTR: 1.2%
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/advertisements/3/edit">
                    <Edit className="h-3 w-3" />
                  </Link>
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando 3 de 8 anúncios
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}