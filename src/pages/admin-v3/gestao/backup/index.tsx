import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Database, Download, Upload, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/useAdminSession";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BackupMetadata {
  id: string;
  filename: string;
  file_size?: number;
  backup_type: string;
  status: string;
  admin_email: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

function BackupRestorePage() {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { adminEmail } = useAdminSession();

  const fetchBackups = async () => {
    if (!adminEmail) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('backup_metadata')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Erro ao carregar backups');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: string = 'full') => {
    if (!adminEmail || creating) return;
    
    setCreating(true);
    try {
      const response = await supabase.functions.invoke('create-backup', {
        body: {
          backup_type: type,
          admin_email: adminEmail
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Backup iniciado! Acompanhe o progresso na tabela abaixo.');
      fetchBackups(); // Refresh the list
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Erro ao iniciar backup: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    if (!adminEmail) return;
    
    try {
      const response = await supabase.functions.invoke('download-backup', {
        headers: {
          'x-admin-email': adminEmail
        },
        body: new URLSearchParams({ backup_id: backupId })
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // The response should be a blob for download
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('Erro ao fazer download: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!adminEmail) return;
    
    try {
      const { error } = await supabase
        .from('backup_metadata')
        .delete()
        .eq('id', backupId);

      if (error) throw error;

      toast.success('Backup removido com sucesso!');
      fetchBackups(); // Refresh the list
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Erro ao remover backup');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completo
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Executando
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Falhou
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  useEffect(() => {
    fetchBackups();
  }, [adminEmail]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Gerencie backups e restauração do sistema
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Os backups são criados de forma assíncrona. 
          O processo pode levar alguns minutos dependendo do tamanho do banco de dados.
          Arquivos de backup são armazenados temporariamente e devem ser baixados rapidamente.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Criar Backup
            </CardTitle>
            <CardDescription>
              Gere um backup completo do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Backup Completo</h4>
              <p className="text-sm text-muted-foreground">
                Inclui todas as tabelas, dados e configurações do sistema
              </p>
              <Button 
                onClick={() => createBackup('full')}
                disabled={creating}
                className="w-full"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Criar Backup Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restaurar Backup
            </CardTitle>
            <CardDescription>
              Restaure o sistema a partir de um backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Backup de Configuração</h4>
              <p className="text-sm text-muted-foreground">
                Cria backup apenas das configurações do sistema (categorias, tipos de artista, etc.)
              </p>
              <Button 
                onClick={() => createBackup('config')}
                disabled={creating}
                variant="outline"
                className="w-full"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Criar Backup de Configuração
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>
            Lista de todos os backups criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-muted-foreground mt-2">Carregando backups...</p>
                    </TableCell>
                  </TableRow>
                ) : backups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Nenhum backup encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {backup.filename}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{backup.backup_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(backup.status)}
                      </TableCell>
                      <TableCell>
                        {formatFileSize(backup.file_size)}
                      </TableCell>
                      <TableCell>{backup.admin_email}</TableCell>
                      <TableCell>
                        {format(new Date(backup.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {backup.status === 'completed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadBackup(backup.id)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteBackup(backup.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BackupRestorePage;