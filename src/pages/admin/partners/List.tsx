import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, ExternalLink, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { usePartnerManagement } from '@/hooks/usePartnerManagement';

export default function PartnersList() {
  const {
    partners,
    loading,
    searchQuery,
    setSearchQuery,
    cityFilter,
    setCityFilter,
    activeFilter,
    setActiveFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    removePartner,
    toggleActive
  } = usePartnerManagement();

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este parceiro?')) {
      await removePartner(id);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await toggleActive(id, !isActive);
  };

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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, categoria ou cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="Porto Alegre">Porto Alegre</SelectItem>
                <SelectItem value="São Paulo">São Paulo</SelectItem>
                <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="Florianópolis">Florianópolis</SelectItem>
                <SelectItem value="Curitiba">Curitiba</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter?.toString() || ''} onValueChange={(value) => setActiveFilter(value === '' ? undefined : value === 'true')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Carregando parceiros...</div>
            </CardContent>
          </Card>
        ) : partners.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                Nenhum parceiro encontrado
              </div>
            </CardContent>
          </Card>
        ) : (
          partners.map((partner) => (
            <Card key={partner.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {partner.location}
                    </p>
                    <Badge variant={partner.is_active ? "default" : "secondary"}>
                      {partner.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div>📍 {partner.location}</div>
                  {partner.website && (
                    <div>🌐 {partner.website}</div>
                  )}
                  {partner.rating && (
                    <div>⭐ {partner.rating}/5</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/admin/partners/${partner.id}/edit`}>
                      <Edit className="h-3 w-3" />
                    </Link>
                  </Button>
                  {partner.website && (
                    <Button size="sm" variant="outline" onClick={() => window.open(partner.website, '_blank')}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant={partner.is_active ? "secondary" : "default"}
                    onClick={() => handleToggleActive(partner.id!, partner.is_active)}
                  >
                    {partner.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(partner.id!)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {partners.length} de {totalCount} parceiros
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