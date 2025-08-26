import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function AdminBlog() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Gerencie artigos e posts do blog
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por título, autor ou conteúdo..."
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Como aproveitar a nightlife em Porto Alegre</h3>
                  <Badge variant="default">Publicado</Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  Descubra os melhores locais para curtir a noite na capital gaúcha...
                </p>
                <div className="text-xs text-muted-foreground">
                  Por Admin • 15 de Jan, 2024 • 5 min de leitura
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
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
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Eventos culturais para o próximo mês</h3>
                  <Badge variant="secondary">Rascunho</Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  Uma seleção especial dos melhores eventos culturais que estão por vir...
                </p>
                <div className="text-xs text-muted-foreground">
                  Por Admin • 12 de Jan, 2024 • 3 min de leitura
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
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
          Mostrando 2 de 15 posts
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