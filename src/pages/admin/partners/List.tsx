import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Star, StarOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { listPartners, deletePartner, togglePartnerFeatured, type Partner, type PartnerFilters } from "@/lib/repositories/partners";
import { deletePartnerLogo } from "@/lib/upload";
import { useSimulationMode } from "@/hooks/useSimulationMode";

export default function PartnersList() {
  const navigate = useNavigate();
  const { isSimulating, simulateOperation, isReadOnlyError } = useSimulationMode();
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PartnerFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; partner?: Partner }>({ open: false });

  const loadPartners = async () => {
    try {
      setLoading(true);
      const result = await listPartners(filters, currentPage, 10);
      setPartners(result.data);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      console.error('Erro ao carregar parceiros:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, [filters, currentPage]);

  const handleSearch = (field: keyof PartnerFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    setCurrentPage(1);
  };

  const handleToggleFeatured = async (partner: Partner) => {
    try {
      if (isReadOnlyError({ message: 'test' })) {
        simulateOperation('Alteração de status', partner.name, () => {
          setPartners(prev => prev.map(p => 
            p.id === partner.id ? { ...p, featured: !p.featured } : p
          ));
        });
        return;
      }

      await togglePartnerFeatured(partner.id, !partner.featured);
      toast.success(`Parceiro ${!partner.featured ? 'destacado' : 'removido dos destaques'}`);
      loadPartners();
    } catch (error: any) {
      if (isReadOnlyError(error)) {
        simulateOperation('Alteração de status', partner.name, () => {
          setPartners(prev => prev.map(p => 
            p.id === partner.id ? { ...p, featured: !p.featured } : p
          ));
        });
      } else {
        console.error('Erro ao alterar status:', error);
        toast.error('Erro ao alterar status do parceiro');
      }
    }
  };

  const handleDelete = async (partner: Partner) => {
    try {
      if (isReadOnlyError({ message: 'test' })) {
        simulateOperation('Exclusão', partner.name, () => {
          setPartners(prev => prev.filter(p => p.id !== partner.id));
        });
        setDeleteDialog({ open: false });
        return;
      }

      // Delete logo if exists
      if (partner.image_url) {
        await deletePartnerLogo(partner.image_url);
      }

      await deletePartner(partner.id);
      toast.success('Parceiro excluído com sucesso');
      setDeleteDialog({ open: false });
      loadPartners();
    } catch (error: any) {
      if (isReadOnlyError(error)) {
        simulateOperation('Exclusão', partner.name, () => {
          setPartners(prev => prev.filter(p => p.id !== partner.id));
        });
        setDeleteDialog({ open: false });
      } else {
        console.error('Erro ao excluir parceiro:', error);
        toast.error('Erro ao excluir parceiro');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parceiros</h1>
        <Link to="/admin/partners/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Parceiro
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome..."
                  value={filters.name || ''}
                  onChange={(e) => handleSearch('name', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Localização</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por cidade..."
                  value={filters.location || ''}
                  onChange={(e) => handleSearch('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.featured === true}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, featured: checked ? true : undefined }))
                  }
                />
                <span className="text-sm">Apenas destacados</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum parceiro encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      {partner.image_url ? (
                        <img 
                          src={partner.image_url} 
                          alt={partner.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>{partner.location}</TableCell>
                    <TableCell>
                      {partner.contact_email ? (
                        <a href={`mailto:${partner.contact_email}`} className="text-blue-600 hover:underline">
                          {partner.contact_email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={partner.featured ? "default" : "secondary"}>
                        {partner.featured ? "Destacado" : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(partner)}
                          disabled={isSimulating}
                        >
                          {partner.featured ? (
                            <StarOff className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/partners/${partner.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, partner })}
                          disabled={isSimulating}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o parceiro "{deleteDialog.partner?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.partner && handleDelete(deleteDialog.partner)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}