import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useArtistRoles, useDeleteArtistRole, ArtistRole } from '@/hooks/useArtistRoles';
import { ArtistRoleForm } from './ArtistRoleForm';
import { useDebounce } from 'use-debounce';

export function ArtistRolesTable() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [editingRole, setEditingRole] = useState<ArtistRole | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: roles, isLoading } = useArtistRoles(debouncedSearch);
  const deleteRole = useDeleteArtistRole();

  const handleEdit = (role: ArtistRole) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (role: ArtistRole) => {
    if (window.confirm(`Tem certeza que deseja excluir a função "${role.name}"?`)) {
      deleteRole.mutate(role.id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRole(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar funções..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Função
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : !roles?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {search ? 'Nenhuma função encontrada.' : 'Nenhuma função cadastrada.'}
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">{role.slug}</TableCell>
                  <TableCell>
                    <Badge variant={role.is_active ? 'default' : 'secondary'}>
                      {role.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(role.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(role)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(role)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Editar Função' : 'Nova Função'}
            </DialogTitle>
          </DialogHeader>
          <ArtistRoleForm role={editingRole} onClose={closeForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
}