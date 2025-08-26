import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPagination, AdminSearchAndFilter, AdminTable } from '@/components/ui/admin-pagination';
import { SaveButton, DeleteButton, UpdateButton } from '@/components/ui/admin-button';
import { useOrganizers, useCreateOrganizer, useUpdateOrganizer, useDeleteOrganizer } from '@/hooks/useAdminQueries';
import { Plus, Edit2, Trash2, Mail, Globe, Instagram } from 'lucide-react';
import { useAdminToast } from '@/hooks/useAdminToast';

interface OrganizerFormData {
  name: string;
  contact_email: string;
  site?: string;
  instagram?: string;
}

interface OrganizerRowProps {
  organizer: any;
  onEdit: (organizer: any) => void;
  onDelete: (id: string) => void;
}

function OrganizerRow({ organizer, onEdit, onDelete }: OrganizerRowProps) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-4">
        <div>
          <p className="font-medium">{organizer.name}</p>
          <p className="text-sm text-muted-foreground">{organizer.contact_email}</p>
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          {organizer.site && (
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Site
            </Badge>
          )}
          {organizer.instagram && (
            <Badge variant="outline" className="text-xs">
              <Instagram className="h-3 w-3 mr-1" />
              Instagram
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(organizer)}
            data-testid={`edit-organizer-${organizer.id}`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <DeleteButton
            onClick={() => onDelete(organizer.id)}
            size="sm"
            data-testid={`delete-organizer-${organizer.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </DeleteButton>
        </div>
      </td>
    </tr>
  );
}

export default function AdminOrganizersOptimized() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrganizer, setEditingOrganizer] = useState<any | null>(null);
  const [formData, setFormData] = useState<OrganizerFormData>({
    name: '',
    contact_email: '',
    site: '',
    instagram: '',
  });

  const { showSuccess, showError } = useAdminToast();

  // Use React Query hook with pagination
  const {
    data: organizersData,
    isLoading,
    error,
    refetch
  } = useOrganizers({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
  });

  const createMutation = useCreateOrganizer();
  const updateMutation = useUpdateOrganizer();
  const deleteMutation = useDeleteOrganizer();

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      contact_email: '',
      site: '',
      instagram: '',
    });
    setEditingOrganizer(null);
  };

  // Handle edit
  const handleEdit = (organizer: any) => {
    setEditingOrganizer(organizer);
    setFormData({
      name: organizer.name || '',
      contact_email: organizer.contact_email || '',
      site: organizer.site || '',
      instagram: organizer.instagram || '',
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.contact_email.trim()) {
      showError(new Error('Nome e e-mail são obrigatórios'));
      return;
    }

    try {
      if (editingOrganizer) {
        await updateMutation.mutateAsync({
          id: editingOrganizer.id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Handle search with debouncing
  const debouncedSearch = useMemo(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6" data-testid="organizers-management">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organizadores</h1>
        <Button 
          onClick={() => setEditingOrganizer({})}
          data-testid="create-organizer-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Organizador
        </Button>
      </div>

      {/* Search and Filters */}
      <AdminSearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Pesquisar organizadores..."
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            Atualizar
          </Button>
        }
      />

      {/* Organizers Table */}
      <AdminTable loading={isLoading} error={error?.message}>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="organizers-list">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left font-medium">Organizador</th>
                <th className="p-4 text-left font-medium">Links</th>
                <th className="p-4 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody data-testid="organizers-table-body">
              {organizersData?.data.map((organizer) => (
                <OrganizerRow
                  key={organizer.id}
                  organizer={organizer}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>

        {organizersData?.data.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum organizador encontrado
          </div>
        )}
      </AdminTable>

      {/* Pagination */}
      {organizersData && organizersData.totalPages > 1 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={organizersData.totalPages}
          totalItems={organizersData.count}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Form Modal */}
      {editingOrganizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {editingOrganizer.id ? 'Editar Organizador' : 'Novo Organizador'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do organizador"
                    data-testid="name-input"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">E-mail *</label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contato@organizador.com"
                    data-testid="contact_email-input"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Site</label>
                  <Input
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="https://site.com"
                    data-testid="site-input"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Instagram</label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@organizador"
                    data-testid="instagram-input"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <SaveButton
                    onClick={async () => {}}
                    disabled={!formData.name.trim() || !formData.contact_email.trim()}
                    className="flex-1"
                    data-testid="submit-button"
                  >
                    {editingOrganizer.id ? 'Atualizar' : 'Criar'}
                  </SaveButton>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}