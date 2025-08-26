import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Database, 
  Shield, 
  Globe, 
  Upload,
  Download,
  Save,
  RefreshCw,
  Search
} from "lucide-react";
import { useAdvancedSettings } from '@/hooks/useAdvancedSettings';

export default function AdminSettings() {
  const {
    configurations,
    seoConfig,
    securityConfig,
    loading,
    activeCategory,
    setActiveCategory,
    updateConfiguration,
    updateSEOConfiguration,
    updateSecurityConfiguration,
    createBackup,
    restoreBackup,
    getConfigurationsByCategory,
    getCategories
  } = useAdvancedSettings();

  const [backupFile, setBackupFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackupFile(file);
    }
  };

  const handleRestoreBackup = async () => {
    if (backupFile) {
      await restoreBackup(backupFile);
      setBackupFile(null);
    }
  };

  const renderConfigurationValue = (config: any) => {
    switch (config.type) {
      case 'boolean':
        return (
          <Switch
            checked={config.value}
            onCheckedChange={(checked) => updateConfiguration(config.id, checked)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={config.value}
            onChange={(e) => updateConfiguration(config.id, parseInt(e.target.value))}
            className="w-32"
          />
        );
      case 'string':
        return (
          <Input
            value={config.value}
            onChange={(e) => updateConfiguration(config.id, e.target.value)}
            className="max-w-md"
          />
        );
      default:
        return (
          <Input
            value={String(config.value)}
            onChange={(e) => updateConfiguration(config.id, e.target.value)}
            className="max-w-md"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações Avançadas</h1>
        <p className="text-muted-foreground">
          Configurações detalhadas do sistema, SEO e segurança
        </p>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>
                  Selecione uma categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {getCategories().map((category) => (
                  <Button
                    key={category.key}
                    variant={activeCategory === category.key ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveCategory(category.key)}
                  >
                    {category.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações - {getCategories().find(c => c.key === activeCategory)?.label}
                </CardTitle>
                <CardDescription>
                  Gerencie as configurações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getConfigurationsByCategory(activeCategory).map((config) => (
                  <div key={config.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">{config.key}</Label>
                        <p className="text-xs text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.is_sensitive && (
                          <Badge variant="destructive" className="text-xs">
                            Sensível
                          </Badge>
                        )}
                        {renderConfigurationValue(config)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações de SEO
              </CardTitle>
              <CardDescription>
                Configure meta tags, Open Graph e configurações de SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título Meta</Label>
                    <Input
                      value={seoConfig?.meta_title || ''}
                      onChange={(e) => updateSEOConfiguration({ meta_title: e.target.value })}
                      placeholder="Título principal do site"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Descrição Meta</Label>
                    <Textarea
                      value={seoConfig?.meta_description || ''}
                      onChange={(e) => updateSEOConfiguration({ meta_description: e.target.value })}
                      placeholder="Descrição do site para mecanismos de busca"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>URL Canônica</Label>
                    <Input
                      value={seoConfig?.canonical_url || ''}
                      onChange={(e) => updateSEOConfiguration({ canonical_url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Robots</Label>
                    <Input
                      value={seoConfig?.robots || ''}
                      onChange={(e) => updateSEOConfiguration({ robots: e.target.value })}
                      placeholder="index, follow"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Open Graph - Título</Label>
                    <Input
                      value={seoConfig?.og_title || ''}
                      onChange={(e) => updateSEOConfiguration({ og_title: e.target.value })}
                      placeholder="Título para redes sociais"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Open Graph - Descrição</Label>
                    <Textarea
                      value={seoConfig?.og_description || ''}
                      onChange={(e) => updateSEOConfiguration({ og_description: e.target.value })}
                      placeholder="Descrição para redes sociais"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Open Graph - Imagem</Label>
                    <Input
                      value={seoConfig?.og_image || ''}
                      onChange={(e) => updateSEOConfiguration({ og_image: e.target.value })}
                      placeholder="URL da imagem para compartilhamento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Analytics ID</Label>
                    <Input
                      value={seoConfig?.analytics_id || ''}
                      onChange={(e) => updateSEOConfiguration({ analytics_id: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={seoConfig?.sitemap_enabled || false}
                  onCheckedChange={(checked) => updateSEOConfiguration({ sitemap_enabled: checked })}
                />
                <Label>Gerar sitemap automaticamente</Label>
              </div>

              <Button onClick={() => updateSEOConfiguration(seoConfig || {})}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações de SEO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure políticas de segurança e acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Política de Senhas</Label>
                    <div className="space-y-3 mt-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Comprimento mínimo</Label>
                        <Input
                          type="number"
                          value={securityConfig?.password_policy.min_length || 8}
                          onChange={(e) => updateSecurityConfiguration({
                            password_policy: {
                              ...securityConfig?.password_policy,
                              min_length: parseInt(e.target.value)
                            }
                          })}
                          className="w-24"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={securityConfig?.password_policy.require_uppercase || false}
                            onCheckedChange={(checked) => updateSecurityConfiguration({
                              password_policy: {
                                ...securityConfig?.password_policy,
                                require_uppercase: checked
                              }
                            })}
                          />
                          <Label className="text-sm">Requer maiúsculas</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={securityConfig?.password_policy.require_numbers || false}
                            onCheckedChange={(checked) => updateSecurityConfiguration({
                              password_policy: {
                                ...securityConfig?.password_policy,
                                require_numbers: checked
                              }
                            })}
                          />
                          <Label className="text-sm">Requer números</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={securityConfig?.password_policy.require_symbols || false}
                            onCheckedChange={(checked) => updateSecurityConfiguration({
                              password_policy: {
                                ...securityConfig?.password_policy,
                                require_symbols: checked
                              }
                            })}
                          />
                          <Label className="text-sm">Requer símbolos</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Timeout de Sessão (segundos)</Label>
                    <Input
                      type="number"
                      value={securityConfig?.session_timeout || 86400}
                      onChange={(e) => updateSecurityConfiguration({
                        session_timeout: parseInt(e.target.value)
                      })}
                      className="w-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Máximo de Tentativas de Login</Label>
                    <Input
                      type="number"
                      value={securityConfig?.max_login_attempts || 5}
                      onChange={(e) => updateSecurityConfiguration({
                        max_login_attempts: parseInt(e.target.value)
                      })}
                      className="w-24"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={securityConfig?.enable_2fa || false}
                      onCheckedChange={(checked) => updateSecurityConfiguration({
                        enable_2fa: checked
                      })}
                    />
                    <Label>Habilitar autenticação de dois fatores</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={securityConfig?.rate_limiting.enabled || false}
                      onCheckedChange={(checked) => updateSecurityConfiguration({
                        rate_limiting: {
                          ...securityConfig?.rate_limiting,
                          enabled: checked
                        }
                      })}
                    />
                    <Label>Habilitar rate limiting</Label>
                  </div>
                </div>
              </div>

              <Button onClick={() => updateSecurityConfiguration(securityConfig || {})}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações de Segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup do Sistema
                </CardTitle>
                <CardDescription>
                  Fazer backup das configurações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O backup inclui todas as configurações do sistema, SEO e segurança.
                </p>
                <Button onClick={createBackup} disabled={loading} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Gerando...' : 'Fazer Backup'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restaurar Backup
                </CardTitle>
                <CardDescription>
                  Restaurar configurações de um arquivo de backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Arquivo de Backup</Label>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                  />
                </div>
                {backupFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {backupFile.name}
                  </p>
                )}
                <Button 
                  onClick={handleRestoreBackup} 
                  disabled={!backupFile || loading}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restaurar Backup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}