import { useToast } from '@/hooks/use-toast';
import { AgendaError, fetchAgenda, fetchCounts, getAgendaItem, getNextPrev } from '@/lib/agenda';
import { LoadingState, ErrorState } from '@/components/ui/loading-error-states';

// Example hook using the new agenda lib
export const useAgendaWithStates = () => {
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    if (error instanceof AgendaError) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erro",
        description: "Algo deu errado",
        variant: "destructive"
      });
    }
  };

  return {
    fetchAgenda,
    fetchCounts,
    getAgendaItem,
    getNextPrev,
    handleError,
    LoadingState,
    ErrorState
  };
};