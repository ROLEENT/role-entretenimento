import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface AdSenseConfig {
  id: string;
  publisher_id: string;
  slot_id: string;
  ad_format: string;
  ad_layout?: string;
  position: string;
  page_type: string;
  is_active: boolean;
  responsive: boolean;
  lazy_loading: boolean;
  created_at: string;
}

export function AdminAdSenseSettings() {
  const [configs, setConfigs] = useState<AdSenseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdSenseConfig>>({});
  const { toast } = useToast();

  const positions = [
    { value: 'header', label: 'Header' },
    { value: 'footer', label: 'Footer' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'in-feed', label: 'In-Feed' },
    { value: 'in-article', label: 'In-Article' }
  ];

  const pageTypes = [
    { value: 'homepage', label: 'Homepage' },
    { value: 'events', label: 'Eventos' },
    { value: 'blog', label: 'Blog' },
    { value: 'highlights', label: 'Destaques' },
    { value: 'all', label: 'Todas as páginas' }
  ];

  const adFormats = [
    { value: 'auto', label: 'Automático' },
    { value: 'rectangle', label: 'Retângulo' },
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' },
    { value: 'responsive', label: 'Responsivo' }
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('adsense_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching AdSense configs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações do AdSense',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.publisher_id || !formData.slot_id || !formData.position || !formData.page_type) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('adsense_settings')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Configuração atualizada com sucesso' });
      } else {
        const { error } = await supabase
          .from('adsense_settings')
          .insert(formData);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Configuração criada com sucesso' });
      }

      setEditingId(null);
      setFormData({});
      fetchConfigs();
    } catch (error) {
      console.error('Error saving AdSense config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (config: AdSenseConfig) => {
    setEditingId(config.id);
    setFormData(config);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;

    try {
      const { error } = await supabase
        .from('adsense_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Configuração excluída com sucesso' });
      fetchConfigs();
    } catch (error) {
      console.error('Error deleting AdSense config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir configuração',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleNewConfig = () => {
    setEditingId('new');
    setFormData({
      publisher_id: 'ca-pub-XXXXXXXXXX',
      slot_id: '',
      ad_format: 'auto',
      position: 'header',
      page_type: 'homepage',
      is_active: true,
      responsive: true,
      lazy_loading: true
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando configurações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configurações Google AdSense</CardTitle>
              <CardDescription>
                Gerencie os anúncios do Google AdSense exibidos no site
              </CardDescription>
            </div>
            <Button onClick={handleNewConfig}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Configuração
            </Button>
          </div>
        </CardHeader>
        
        {editingId && (
          <CardContent className="border-t">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {editingId === 'new' ? 'Nova Configuração' : 'Editar Configuração'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publisher_id">Publisher ID *</Label>
                  <Input
                    id="publisher_id"
                    value={formData.publisher_id || ''}
                    onChange={(e) => setFormData({ ...formData, publisher_id: e.target.value })}
                    placeholder="ca-pub-XXXXXXXXXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slot_id">Slot ID *</Label>
                  <Input
                    id="slot_id"
                    value={formData.slot_id || ''}
                    onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Posição *</Label>
                  <Select
                    value={formData.position || ''}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="page_type">Tipo de Página *</Label>
                  <Select
                    value={formData.page_type || ''}
                    onValueChange={(value) => setFormData({ ...formData, page_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de página" />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ad_format">Formato do Anúncio</Label>
                  <Select
                    value={formData.ad_format || 'auto'}
                    onValueChange={(value) => setFormData({ ...formData, ad_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {adFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="responsive"
                    checked={formData.responsive ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, responsive: checked })}
                  />
                  <Label htmlFor="responsive">Responsivo</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lazy_loading"
                    checked={formData.lazy_loading ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, lazy_loading: checked })}
                  />
                  <Label htmlFor="lazy_loading">Lazy Loading</Label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma configuração encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        {positions.find(p => p.value === config.position)?.label} - {' '}
                        {pageTypes.find(p => p.value === config.page_type)?.label}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Publisher: {config.publisher_id} | Slot: {config.slot_id}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          config.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {config.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        {config.responsive && (
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            Responsivo
                          </span>
                        )}
                        {config.lazy_loading && (
                          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                            Lazy Loading
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(config)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}