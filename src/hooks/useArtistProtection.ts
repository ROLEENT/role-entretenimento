import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  admin_email: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

interface ProtectionStats {
  total_artists: number;
  recent_changes: number;
  failed_operations: number;
  backup_status: 'active' | 'inactive';
}

export const useArtistProtection = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAuditLogs = async (limit = 50) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('table_name', 'artists')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AuditLog[];
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar logs de auditoria",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getProtectionStats = async (): Promise<ProtectionStats> => {
    try {
      const [artistsResponse, recentChangesResponse] = await Promise.all([
        supabase.from('artists').select('id', { count: 'exact', head: true }),
        supabase
          .from('admin_audit_log')
          .select('id', { count: 'exact', head: true })
          .eq('table_name', 'artists')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        total_artists: artistsResponse.count || 0,
        recent_changes: recentChangesResponse.count || 0,
        failed_operations: 0, // Implementar contagem de falhas se necessário
        backup_status: 'active'
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_artists: 0,
        recent_changes: 0,
        failed_operations: 0,
        backup_status: 'inactive'
      };
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-artist-backup');
      
      if (error) throw error;
      
      toast({
        title: "Backup Criado",
        description: "Backup dos artistas criado com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar backup",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validateArtistOperation = async (operation: 'delete' | 'update', artistId: string) => {
    try {
      const { data: artist } = await supabase
        .from('artists')
        .select('stage_name, created_at')
        .eq('id', artistId)
        .single();

      if (!artist) return false;

      // Verificar se é um artista recente (menos de 1 hora)
      const isRecent = new Date(artist.created_at).getTime() > Date.now() - 60 * 60 * 1000;
      
      if (operation === 'delete' && !isRecent) {
        // Require confirmation for deleting non-recent artists
        return confirm(`Tem certeza que deseja excluir o artista "${artist.stage_name}"? Esta ação não pode ser desfeita.`);
      }

      return true;
    } catch (error) {
      console.error('Erro na validação:', error);
      return false;
    }
  };

  return {
    loading,
    getAuditLogs,
    getProtectionStats,
    createBackup,
    validateArtistOperation
  };
};