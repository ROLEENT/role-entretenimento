import React, { useState, useEffect } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Database, Download, Upload, Trash2, Calendar, FileText, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useAdminSession } from '@/hooks/useAdminSession';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BackupMetadata {
  id: string;
  filename: string;
  backup_type: string;
  status: string;
  created_at: string;
  completed_at?: string;
  file_size?: number;
  error_message?: string;
}

const BackupRestorePage: React.FC = () => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupType, setBackupType] = useState('full');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { adminEmail } = useAdminSession();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Gestão', path: '/admin-v3/gestao' },
    { label: 'Backup & Restore' },
  ];

  const loadBackups = async () => {
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
      console.error('Erro ao carregar backups:', error);
      toast.error('Erro ao carregar lista de backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, [adminEmail]);

  const createBackup = async () => {
    if (!adminEmail) {
      toast.error('Sessão de admin necessária');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Simular progresso de backup
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const filename = `backup-${backupType}-${new Date().toISOString().split('T')[0]}-${Date.now()}.sql`;

      // Registrar metadata do backup
      const { data, error } = await supabase
        .from('backup_metadata')
        .insert({
          filename,
          backup_type: backupType,
          status: 'pending',
          admin_email: adminEmail
        })
        .select()
        .single();

      if (error) throw error;

      // Simular processo de backup (em produção seria chamada para edge function)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar status para concluído
      await supabase
        .from('backup_metadata')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          file_size: Math.floor(Math.random() * 1000000) + 100000 // Tamanho simulado
        })
        .eq('id', data.id);

      clearInterval(progressInterval);
      setProgress(100);
      
      toast.success('Backup criado com sucesso');
      loadBackups();
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const downloadBackup = async (backup: BackupMetadata) => {
    try {
      // Em produção, isso faria download do arquivo real
      const content = `-- Backup ${backup.backup_type} criado em ${backup.created_at}\n-- Arquivo: ${backup.filename}\n\n-- Este é um backup simulado\n-- Em produção, conteria os dados reais do banco\n`;
      
      const blob = new Blob([content], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Download iniciado');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do backup');
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const { error } = await supabase
        .from('backup_metadata')
        .delete()
        .eq('id', backupId);

      if (error) throw error;
      
      toast.success('Backup removido com sucesso');
      loadBackups();
    } catch (error) {
      console.error('Erro ao remover backup:', error);
      toast.error('Erro ao remover backup');
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para restauração');
      return;
    }

    setLoading(true);
    try {
      // Em produção, o arquivo seria processado aqui
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Restauração simulada concluída (funcionalidade em desenvolvimento)');
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro na restauração:', error);
      toast.error('Erro na restauração');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default' as const,
      pending: 'secondary' as const,
      error: 'destructive' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'completed' ? 'Concluído' : 
         status === 'pending' ? 'Pendente' : 
         status === 'error' ? 'Erro' : status}
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <AdminPageWrapper
      title="Backup & Restore"
      description="Gerencie backups e restauração do banco de dados"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Criar Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Criar Novo Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Backup</Label>
                <Select value={backupType} onValueChange={setBackupType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Completo (Todos os dados)</SelectItem>
                    <SelectItem value="schema">Estrutura (Apenas esquema)</SelectItem>
                    <SelectItem value="data">Dados (Apenas dados)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={createBackup} disabled={loading} className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  {loading ? 'Criando...' : 'Criar Backup'}
                </Button>
              </div>
            </div>

            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso do backup</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restaurar Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restaurar Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Arquivo de Backup</Label>
                <Input
                  type="file"
                  accept=".sql,.dump"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex items-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!selectedFile || loading} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Restaurar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>⚠️ <strong>ATENÇÃO:</strong> Esta operação irá:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Substituir todos os dados atuais</li>
                          <li>Não pode ser desfeita</li>
                          <li>Pode causar tempo de inatividade</li>
                        </ul>
                        <p>Tem certeza que deseja continuar?</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRestore}>
                        Sim, Restaurar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {selectedFile && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Arquivo selecionado:</strong> {selectedFile.name} 
                  ({formatFileSize(selectedFile.size)})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Backups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Backups Existentes
              </CardTitle>
              <Button onClick={loadBackups} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum backup encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(backup.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{backup.filename}</p>
                          {getStatusBadge(backup.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(backup.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span>Tipo: {backup.backup_type}</span>
                          <span>Tamanho: {formatFileSize(backup.file_size)}</span>
                        </div>
                        {backup.error_message && (
                          <p className="text-sm text-destructive mt-1">{backup.error_message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {backup.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBackup(backup)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Backup</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover este backup? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteBackup(backup.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
};

export default BackupRestorePage;