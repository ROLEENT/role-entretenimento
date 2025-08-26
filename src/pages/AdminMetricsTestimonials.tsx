import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, MessageSquare, Edit, Trash2, Plus, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminMetricsTestimonials = () => {
  const { toast } = useToast();
  
  // Metrics state
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [editingMetric, setEditingMetric] = useState<any>(null);
  const [showMetricDialog, setShowMetricDialog] = useState(false);
  const [metricForm, setMetricForm] = useState({
    key: '',
    value: '',
    label: '',
    is_public: false
  });

  // Testimonials state
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [showTestimonialDialog, setShowTestimonialDialog] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    author: '',
    role: '',
    quote: '',
    source_url: '',
    rating: 5,
    is_published: false
  });

  useEffect(() => {
    loadMetrics();
    loadTestimonials();
  }, []);

  // Metrics functions
  const loadMetrics = async () => {
    try {
      setMetricsLoading(true);
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar métricas",
        variant: "destructive"
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  const resetMetricForm = () => {
    setMetricForm({
      key: '',
      value: '',
      label: '',
      is_public: false
    });
    setEditingMetric(null);
  };

  const handleEditMetric = (metric: any) => {
    setEditingMetric(metric);
    setMetricForm({
      key: metric.key,
      value: metric.value.toString(),
      label: metric.label,
      is_public: metric.is_public
    });
    setShowMetricDialog(true);
  };

  const handleMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetricsLoading(true);

    try {
      const metricData = {
        key: metricForm.key,
        value: parseFloat(metricForm.value),
        label: metricForm.label,
        is_public: metricForm.is_public
      };

      if (editingMetric) {
        const { error } = await supabase
          .from('metrics')
          .update(metricData)
          .eq('id', editingMetric.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Métrica atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('metrics')
          .insert(metricData);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Métrica criada com sucesso"
        });
      }

      setShowMetricDialog(false);
      resetMetricForm();
      loadMetrics();
    } catch (error: any) {
      console.error('Erro ao salvar métrica:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar métrica",
        variant: "destructive"
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleDeleteMetric = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta métrica?')) return;

    try {
      const { error } = await supabase
        .from('metrics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Métrica excluída com sucesso"
      });

      loadMetrics();
    } catch (error: any) {
      console.error('Erro ao excluir métrica:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir métrica",
        variant: "destructive"
      });
    }
  };

  // Testimonials functions
  const loadTestimonials = async () => {
    try {
      setTestimonialsLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar depoimentos",
        variant: "destructive"
      });
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const resetTestimonialForm = () => {
    setTestimonialForm({
      author: '',
      role: '',
      quote: '',
      source_url: '',
      rating: 5,
      is_published: false
    });
    setEditingTestimonial(null);
  };

  const handleEditTestimonial = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setTestimonialForm({
      author: testimonial.author,
      role: testimonial.role || '',
      quote: testimonial.quote,
      source_url: testimonial.source_url || '',
      rating: testimonial.rating,
      is_published: testimonial.is_published
    });
    setShowTestimonialDialog(true);
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialsLoading(true);

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialForm)
          .eq('id', editingTestimonial.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Depoimento atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(testimonialForm);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Depoimento criado com sucesso"
        });
      }

      setShowTestimonialDialog(false);
      resetTestimonialForm();
      loadTestimonials();
    } catch (error: any) {
      console.error('Erro ao salvar depoimento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar depoimento",
        variant: "destructive"
      });
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Depoimento excluído com sucesso"
      });

      loadTestimonials();
    } catch (error: any) {
      console.error('Erro ao excluir depoimento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir depoimento",
        variant: "destructive"
      });
    }
  };

  const toggleTestimonialPublished = async (testimonial: any) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_published: !testimonial.is_published })
        .eq('id', testimonial.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Depoimento ${!testimonial.is_published ? 'publicado' : 'despublicado'} com sucesso`
      });

      loadTestimonials();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status",
        variant: "destructive"
      });
    }
  };

  const toggleMetricPublic = async (metric: any) => {
    try {
      const { error } = await supabase
        .from('metrics')
        .update({ is_public: !metric.is_public })
        .eq('id', metric.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Métrica ${!metric.is_public ? 'tornada pública' : 'tornada privada'} com sucesso`
      });

      loadMetrics();
    } catch (error: any) {
      console.error('Erro ao alterar visibilidade:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar visibilidade",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Métricas e Depoimentos</h1>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Gerenciar Métricas</h2>
            
            <Dialog open={showMetricDialog} onOpenChange={setShowMetricDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetMetricForm(); setShowMetricDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Métrica
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMetric ? 'Editar Métrica' : 'Nova Métrica'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleMetricSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Chave *</Label>
                    <Input
                      id="key"
                      value={metricForm.key}
                      onChange={(e) => setMetricForm(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="site_reach"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="label">Rótulo *</Label>
                    <Input
                      id="label"
                      value={metricForm.label}
                      onChange={(e) => setMetricForm(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Alcance do Site"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">Valor *</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.1"
                      value={metricForm.value}
                      onChange={(e) => setMetricForm(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="850"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={metricForm.is_public}
                      onCheckedChange={(checked) => setMetricForm(prev => ({ ...prev, is_public: checked }))}
                    />
                    <Label htmlFor="public">Público</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMetricDialog(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={metricsLoading} className="flex-1">
                      {metricsLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        editingMetric ? 'Atualizar' : 'Criar'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {metricsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Carregando métricas...</p>
            </div>
          ) : metrics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma métrica encontrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {metrics.map((metric) => (
                <Card key={metric.id} className={metric.is_public ? 'border-green-200' : 'border-gray-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{metric.label}</h3>
                          <span className="text-sm text-muted-foreground">({metric.key})</span>
                        </div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={metric.is_public}
                            onCheckedChange={() => toggleMetricPublic(metric)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {metric.is_public ? 'Público' : 'Privado'}
                          </span>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMetric(metric)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMetric(metric.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Gerenciar Depoimentos</h2>
            
            <Dialog open={showTestimonialDialog} onOpenChange={setShowTestimonialDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetTestimonialForm(); setShowTestimonialDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Depoimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Autor *</Label>
                    <Input
                      id="author"
                      value={testimonialForm.author}
                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, author: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Função/Cargo</Label>
                    <Input
                      id="role"
                      value={testimonialForm.role}
                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quote">Depoimento *</Label>
                    <Textarea
                      id="quote"
                      value={testimonialForm.quote}
                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, quote: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source_url">URL da Fonte</Label>
                    <Input
                      id="source_url"
                      type="url"
                      value={testimonialForm.source_url}
                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, source_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Avaliação</Label>
                    <div className="flex items-center gap-2">
                      <select
                        id="rating"
                        value={testimonialForm.rating}
                        onChange={(e) => setTestimonialForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map(rating => (
                          <option key={rating} value={rating}>
                            {rating} estrela{rating > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < testimonialForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={testimonialForm.is_published}
                      onCheckedChange={(checked) => setTestimonialForm(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label htmlFor="published">Publicar depoimento</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTestimonialDialog(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={testimonialsLoading} className="flex-1">
                      {testimonialsLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        editingTestimonial ? 'Atualizar' : 'Criar'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {testimonialsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Carregando depoimentos...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum depoimento encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className={testimonial.is_published ? 'border-green-200' : 'border-gray-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{testimonial.author}</h3>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        {testimonial.role && (
                          <p className="text-sm text-muted-foreground mb-2">{testimonial.role}</p>
                        )}
                        <p className="text-sm italic mb-2">"{testimonial.quote}"</p>
                        {testimonial.source_url && (
                          <a 
                            href={testimonial.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Ver fonte
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={testimonial.is_published}
                            onCheckedChange={() => toggleTestimonialPublished(testimonial)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {testimonial.is_published ? 'Publicado' : 'Rascunho'}
                          </span>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTestimonial(testimonial)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMetricsTestimonials;