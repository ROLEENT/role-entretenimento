import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Filter, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
  sortable?: boolean;
}

interface Filter {
  key: string;
  label: string;
  type: 'select' | 'search';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface Action {
  type: 'view' | 'edit' | 'delete' | 'custom';
  label?: string;
  icon?: React.ReactNode;
  href?: (item: any) => string;
  onClick?: (item: any) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  requiresRole?: 'admin' | 'editor';
  visible?: (item: any) => boolean;
}

interface AdminDataTableProps {
  title: string;
  description?: string;
  data: any[];
  columns: Column[];
  filters?: Filter[];
  actions?: Action[];
  loading?: boolean;
  createButton?: {
    label: string;
    href: string;
  };
  onDelete?: (id: string) => Promise<void>;
  onSearch?: (query: string) => void;
  onFilter?: (key: string, value: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  totalCount?: number;
}

export function AdminDataTable({
  title,
  description,
  data,
  columns,
  filters = [],
  actions = [],
  loading = false,
  createButton,
  onDelete,
  onSearch,
  onFilter,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum item encontrado.",
  totalCount
}: AdminDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  const { isAdmin } = useAuth();
  const role = isAdmin ? 'admin' : 'editor';
  const canDelete = isAdmin;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilter = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    onFilter?.(key, value);
  };

  const handleDelete = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
      setDeleteItemId(null);
    }
  };

  const canPerformAction = (action: Action) => {
    if (action.requiresRole === 'admin' && role !== 'admin') return false;
    if (action.requiresRole === 'editor' && role !== 'admin' && role !== 'editor') return false;
    if (action.type === 'delete' && !canDelete) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {createButton && (
          <Button asChild>
            <Link to={createButton.href}>
              <Plus className="mr-2 h-4 w-4" />
              {createButton.label}
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      {(onSearch || filters.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {onSearch && (
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              
              {filters.map((filter) => (
                <div key={filter.key} className="w-48">
                  {filter.type === 'select' && (
                    <Select 
                      value={filterValues[filter.key] || 'all'} 
                      onValueChange={(value) => handleFilter(filter.key, value)}
                    >
                      <SelectTrigger>
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder={filter.label} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {title} ({totalCount ?? data.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {columns.map((column) => (
                      <div key={column.key} className="space-y-1">
                        {column.render ? 
                          column.render(item[column.key], item) :
                          <span className="text-sm">{item[column.key]}</span>
                        }
                      </div>
                    ))}
                  </div>

                  {actions.length > 0 && (
                    <div className="flex items-center space-x-2">
                      {actions.map((action, actionIndex) => {
                        if (!canPerformAction(action)) return null;
                        if (action.visible && !action.visible(item)) return null;

                        if (action.type === 'view' && action.href) {
                          return (
                            <Button key={actionIndex} variant="outline" size="sm" asChild>
                              <Link to={action.href(item)}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          );
                        }

                        if (action.type === 'edit' && action.href) {
                          return (
                            <Button key={actionIndex} variant="outline" size="sm" asChild>
                              <Link to={action.href(item)}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          );
                        }

                        if (action.type === 'delete') {
                          return (
                            <AlertDialog key={actionIndex}>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          );
                        }

                        if (action.type === 'custom' && action.onClick) {
                          return (
                            <Button 
                              key={actionIndex}
                              variant={action.variant || "outline"} 
                              size="sm"
                              onClick={() => action.onClick!(item)}
                            >
                              {action.icon}
                              {action.label && <span className="ml-2">{action.label}</span>}
                            </Button>
                          );
                        }

                        return null;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}