import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useAdvertisementManagement } from '@/hooks/useAdvertisementManagement';

export default function AdvertisementsList() {
  const {
    advertisements,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    removeAdvertisement,
    updateStatus
  } = useAdvertisementManagement();

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este anúncio?')) {
      await removeAdvertisement(id);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await updateStatus(id, isActive ? 'paused' : 'active');
  };

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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título, anunciante ou posição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Carregando anúncios...</div>
            </CardContent>
          </Card>
        ) : advertisements.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                Nenhum anúncio encontrado
              </div>
            </CardContent>
          </Card>
        ) : (
          advertisements.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      {ad.type === 'banner' ? 'Banner' : ad.type}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{ad.title}</h3>
                        <Badge variant={ad.active ? "default" : "secondary"}>
                          {ad.active ? "Ativo" : "Pausado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {ad.description || 'Sem descrição'}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Tipo: {ad.type} • Posição: {ad.position || 'Não definida'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleStatus(ad.id!, ad.active)}
                    >
                      {ad.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/advertisements/${ad.id}/edit`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(ad.id!)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {advertisements.length} de {totalCount} anúncios
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}