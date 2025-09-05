import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { bulkSoftDeleteEvents, bulkRestoreEvents, bulkHardDeleteEvents } from "@/lib/api/eventBulkActions";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface BulkActionsBarProps {
  selectedEventIds: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
  showDeleted?: boolean;
}

export function BulkActionsBar({
  selectedEventIds,
  onClearSelection,
  onRefresh,
  showDeleted = false
}: BulkActionsBarProps) {
  const [loading, setLoading] = useState(false);
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);

  const selectedCount = selectedEventIds.length;

  if (selectedCount === 0) return null;

  const handleBulkSoftDelete = async () => {
    setLoading(true);
    try {
      await bulkSoftDeleteEvents(selectedEventIds);
      toast.success(`${selectedCount} evento(s) movido(s) para lixeira`);
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao mover eventos para lixeira");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    setLoading(true);
    try {
      await bulkRestoreEvents(selectedEventIds);
      toast.success(`${selectedCount} evento(s) restaurado(s)`);
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao restaurar eventos");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkHardDelete = async () => {
    setLoading(true);
    try {
      await bulkHardDeleteEvents(selectedEventIds);
      toast.success(`${selectedCount} evento(s) excluído(s) definitivamente`);
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao excluir eventos definitivamente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount} evento(s) selecionado(s)
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {!showDeleted ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkSoftDelete}
            disabled={loading}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Mover para lixeira
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkRestore}
            disabled={loading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </Button>
        )}
        
        {showDeleted && (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setHardDeleteDialogOpen(true)}
              disabled={loading}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Excluir definitivamente
            </Button>
            
            <ConfirmationDialog
              open={hardDeleteDialogOpen}
              onOpenChange={setHardDeleteDialogOpen}
              title="Excluir definitivamente"
              description={`Tem certeza que deseja excluir definitivamente ${selectedCount} evento(s)? Esta ação não pode ser desfeita.`}
              confirmText="Excluir definitivamente"
              variant="destructive"
              onConfirm={handleBulkHardDelete}
            />
          </>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}