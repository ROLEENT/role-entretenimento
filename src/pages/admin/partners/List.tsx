import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function PartnersList() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parceiros</h1>
          <p className="text-muted-foreground">
            Gerencie parcerias e colaborações
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/partners/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Parceiro
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Parceiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, categoria ou cidade..."
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Teatro São Pedro</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Teatro histórico no centro de Porto Alegre
                </p>
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>📍 Porto Alegre, RS</div>
              <div>🎭 Teatro & Cultura</div>
              <div>⭐ Parceiro Premium</div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin/partners/1/edit">
                  <Edit className="h-3 w-3" />
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Bar do Goethe</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Casa noturna com programação cultural diversa
                </p>
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>📍 Porto Alegre, RS</div>
              <div>🍻 Bar & Música</div>
              <div>⭐ Parceiro Básico</div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin/partners/2/edit">
                  <Edit className="h-3 w-3" />
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Galeria Mamute</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Espaço de arte contemporânea
                </p>
                <Badge variant="secondary">Pendente</Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>📍 Florianópolis, SC</div>
              <div>🎨 Arte & Exposições</div>
              <div>⭐ Em análise</div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin/partners/3/edit">
                  <Edit className="h-3 w-3" />
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando 3 de 12 parceiros
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