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
import { useGenres, useDeleteGenre, Genre } from '@/hooks/useGenres';
import { GenreForm } from './GenreForm';
import { useDebounce } from 'use-debounce';

export function GenresTable() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: genres, isLoading } = useGenres(debouncedSearch);
  const deleteGenre = useDeleteGenre();

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingGenre(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (genre: Genre) => {
    if (window.confirm(`Tem certeza que deseja excluir o gênero "${genre.name}"?`)) {
      deleteGenre.mutate(genre.id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingGenre(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar gêneros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Gênero
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
            ) : !genres?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {search ? 'Nenhum gênero encontrado.' : 'Nenhum gênero cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              genres.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell className="font-medium">{genre.name}</TableCell>
                  <TableCell className="text-muted-foreground">{genre.slug}</TableCell>
                  <TableCell>
                    <Badge variant={genre.is_active ? 'default' : 'secondary'}>
                      {genre.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(genre.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(genre)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(genre)}
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
              {editingGenre ? 'Editar Gênero' : 'Novo Gênero'}
            </DialogTitle>
          </DialogHeader>
          <GenreForm genre={editingGenre} onClose={closeForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
}