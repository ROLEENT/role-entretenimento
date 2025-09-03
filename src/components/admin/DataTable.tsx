import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Download, 
  Eye, 
  ChevronUp, 
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Archive
} from "lucide-react";
// Removido: usando sistema unificado de dropdowns
import { toast } from "sonner";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  onSearch?: (query: string) => void;
  onStatusFilter?: (status: string) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onView?: (item: T) => void;
  onExportCsv?: (selectedItems: T[]) => void;
  onExportCsvByDate?: (startDate: string, endDate: string) => void;
  onBatchStatusChange?: (selectedItems: T[], newStatus: string) => void;
  onDelete?: (selectedItems: T[]) => void;
  getRowId: (item: T) => string;
  showActions?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  searchPlaceholder = "Buscar...",
  statusOptions = [],
  onSearch,
  onStatusFilter,
  onSort,
  onView,
  onExportCsv,
  onExportCsvByDate,
  onBatchStatusChange,
  onDelete,
  getRowId,
  showActions = true,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    onStatusFilter?.(status === "all" ? "" : status);
  };

  const handleSort = (key: keyof T) => {
    const newDirection = sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(getRowId)));
    }
  };

  const toggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const getSelectedData = () => {
    return data.filter(item => selectedItems.has(getRowId(item)));
  };

  const handleExportCsv = () => {
    const selectedData = getSelectedData();
    if (selectedData.length === 0) {
      toast.error("Selecione pelo menos um item para exportar");
      return;
    }
    onExportCsv?.(selectedData);
  };

  const handleExportCsvByDate = () => {
    if (!startDate || !endDate) {
      toast.error("Selecione um período para exportar");
      return;
    }
    onExportCsvByDate?.(startDate, endDate);
    setShowDateFilter(false);
    setStartDate("");
    setEndDate("");
  };

  const handleBatchStatusChange = (newStatus: string) => {
    const selectedData = getSelectedData();
    if (selectedData.length === 0) {
      toast.error("Selecione pelo menos um item");
      return;
    }
    onBatchStatusChange?.(selectedData, newStatus);
    setSelectedItems(new Set());
  };

  const handleDelete = () => {
    const selectedData = getSelectedData();
    if (selectedData.length === 0) {
      toast.error("Selecione pelo menos um item para excluir");
      return;
    }
    onDelete?.(selectedData);
    setSelectedItems(new Set());
  };

  const getSortIcon = (columnKey: keyof T) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 w-full md:w-[300px]"
            />
          </div>
          
          {statusOptions.length > 0 && (
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
               <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg">
                 <SelectItem value="all">Todos os status</SelectItem>
                 {statusOptions.map((option) => (
                   <SelectItem key={option.value} value={option.value}>
                     {option.label}
                   </SelectItem>
                 ))}
               </SelectContent>
            </Select>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar por Período
            </Button>

            {selectedItems.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV ({selectedItems.size})
                </Button>
                
                {statusOptions.length > 0 && (
                  <div className="dd" data-dd>
                    <Button variant="outline" size="sm" className="dd-trigger gap-2" data-dd-trigger>
                      <Archive className="h-4 w-4" />
                      Alterar Status
                      <span data-dd-icon>⌄</span>
                    </Button>
                    <div className="dd-menu" data-dd-menu role="menu">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          role="menuitem"
                          type="button"
                          onClick={() => handleBatchStatusChange(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir ({selectedItems.size})
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Date Filter */}
      {showDateFilter && onExportCsvByDate && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium">Exportar por Período</h3>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleExportCsvByDate} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDateFilter(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedItems.size === data.length && data.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
              {showActions && <TableHead className="w-[100px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                  {showActions && <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 2 : 1)} className="h-24 text-center">
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const itemId = getRowId(item);
                return (
                  <TableRow
                    key={itemId}
                    className={selectedItems.has(itemId) ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(itemId)}
                        onCheckedChange={() => toggleSelectItem(itemId)}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || '-')}
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell>
                        <div className="dd" data-dd data-dd-align="right">
                          <Button variant="ghost" size="sm" className="dd-trigger" data-dd-trigger aria-label="Ações">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          <div className="dd-menu" data-dd-menu role="menu">
                            <button role="menuitem" type="button" onClick={() => onView?.(item)}>
                              <Eye className="h-4 w-4" />
                              Visualizar
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}