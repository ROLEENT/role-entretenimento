import React, { useState, useEffect } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Download, Upload, Trash2, Calendar, FileText, AlertTriangle, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { useAdminSession } from '@/hooks/useAdminSession';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfigBackup {
  id: string;
  name: string;
  created_at: string;
  admin_email: string;
  config_data: any;
}

const BackupRestorePage: React.FC = () => {
  const [configBackups, setConfigBackups] = useState<ConfigBackup[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { adminEmail } = useAdminSession();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Gestão', path: '/admin-v3/gestao' },
    { label: 'Backup & Restore' },
  ];

  const loadConfigBackups = async () => {
    if (!adminEmail) return;

    setLoading(true);
    try {
      // In a real implementation, this would query a configurations backup table
      // For now, we'll simulate with local storage backups
      const backups = localStorage.getItem('admin_config_backups');
      if (backups) {
        setConfigBackups(JSON.parse(backups));
      }
    } catch (error) {
      console.error('Erro ao carregar backups de configuração:', error);
      toast.error('Erro ao carregar backups de configuração');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigBackups();
  }, [adminEmail]);

  const createConfigBackup = async () => {
    if (!adminEmail || !backupName.trim()) {
      toast.error('Nome do backup é obrigatório');
      return;
    }

    setLoading(true);
    try {
      // Export configuration settings
      const configData = {
        backup_info: {
          name: backupName,
          created_at: new Date().toISOString(),
          admin_email: adminEmail,
          version: '1.0'
        },
        // In a real app, you would export actual configurations here
        categories: await supabase.from('categories').select('*'),
        // Add other configuration tables as needed
      };

      const backup: ConfigBackup = {
        id: Date.now().toString(),
        name: backupName,
        created_at: new Date().toISOString(),
        admin_email: adminEmail,
        config_data: configData
      };

      // Save to local storage (in production, save to a dedicated backup table)
      const existingBackups = localStorage.getItem('admin_config_backups');
      const backups = existingBackups ? JSON.parse(existingBackups) : [];
      backups.push(backup);
      localStorage.setItem('admin_config_backups', JSON.stringify(backups));

      toast.success('Backup de configuração criado com sucesso');
      setBackupName('');
      loadConfigBackups();
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup de configuração');
    } finally {
      setLoading(false);
    }
  };

  const downloadConfigBackup = async (backup: ConfigBackup) => {
    try {
      const content = JSON.stringify(backup.config_data, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `config-backup-${backup.name}-${backup.created_at.split('T')[0]}.json`;
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

  const deleteConfigBackup = async (backupId: string) => {
    try {
      const existingBackups = localStorage.getItem('admin_config_backups');
      if (existingBackups) {
        const backups = JSON.parse(existingBackups);
        const filteredBackups = backups.filter((b: ConfigBackup) => b.id !== backupId);
        localStorage.setItem('admin_config_backups', JSON.stringify(filteredBackups));
      }
      
      toast.success('Backup removido com sucesso');
      loadConfigBackups();
    } catch (error) {
      console.error('Erro ao remover backup:', error);
      toast.error('Erro ao remover backup');
    }
  };

  const handleConfigRestore = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para restauração');
      return;
    }

    setLoading(true);
    try {
      const fileContent = await selectedFile.text();
      const configData = JSON.parse(fileContent);
      
      // Here you would restore the configuration to the database
      // For demonstration, we'll just show a success message
      
      toast.success('Configurações restauradas com sucesso (demonstração)');
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro na restauração:', error);
      toast.error('Erro ao restaurar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageWrapper
      title="Backup & Restore"
      description="Gerencie backups de configurações do sistema"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Esta página gerencia apenas backups de configurações (categorias, settings, etc.). 
            Para backup completo do banco de dados, consulte a documentação do Supabase sobre backups automáticos.
          </AlertDescription>
        </Alert>

        {/* Backup de Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Backup de Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome do Backup</Label>
                <Input
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="Ex: Configurações Produção 2024"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={createConfigBackup} disabled={loading || !backupName.trim()} className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  {loading ? 'Criando...' : 'Criar Backup'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurar Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restaurar Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Arquivo de Configuração</Label>
                <Input
                  type="file"
                  accept=".json"
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
                        <p>⚠️ <strong>ATENÇÃO:</strong> Esta operação irá substituir as configurações atuais.</p>
                        <p>Recomenda-se fazer um backup das configurações atuais antes de prosseguir.</p>
                        <p>Tem certeza que deseja continuar?</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfigRestore}>
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
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Backups de Configuração */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Backups de Configuração
              </CardTitle>
              <Button onClick={loadConfigBackups} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {configBackups.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum backup de configuração encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {configBackups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{backup.name}</p>
                          <Badge variant="default">Configuração</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(backup.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span>Por: {backup.admin_email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadConfigBackup(backup)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
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
                            <AlertDialogAction onClick={() => deleteConfigBackup(backup.id)}>
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

        {/* Info sobre backup do banco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup do Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Backup automático:</strong> O Supabase já realiza backups automáticos diários.</p>
                  <p><strong>Point-in-time recovery:</strong> Disponível para planos Pro e Enterprise.</p>
                  <p><strong>Para backup manual:</strong> Use o dashboard do Supabase ou a CLI.</p>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
};

export default BackupRestorePage;