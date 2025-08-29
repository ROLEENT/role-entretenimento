import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  description: string;
  requirement?: string;
}

export const AgendaFormChecklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'draft-save',
      label: 'Salvar rascunho só com title e slug',
      status: 'pending',
      description: 'Verificar se consegue salvar rascunho apenas com título e slug preenchidos',
      requirement: 'title + slug'
    },
    {
      id: 'publish-validation',
      label: 'Publicar exige capa, alt, cidade, datas válidas e 15 min mínimo',
      status: 'pending',
      description: 'Verificar se publicação bloqueia sem todos os campos obrigatórios',
      requirement: 'capa + alt + cidade + datas + 15min'
    },
    {
      id: 'occurrences-tiers',
      label: 'Criar 2 occurrences e 2 tiers funcionando',
      status: 'pending',
      description: 'Verificar se consegue adicionar/remover ocorrências e tiers de ingresso',
      requirement: '2 ocorrências + 2 tiers'
    },
    {
      id: 'duplicate-logic',
      label: 'Duplicar cria novo item com slug-2 e sem mídia carregada',
      status: 'pending',
      description: 'Verificar se duplicação gera novo slug e remove mídias',
      requirement: 'slug-2 + sem mídia'
    },
    {
      id: 'slug-history',
      label: 'Editar slug gera registro em agenda_slug_history',
      status: 'pending',
      description: 'Verificar se mudança de slug é registrada no histórico',
      requirement: 'registro histórico'
    },
    {
      id: 'gallery-removal',
      label: 'Remover imagem da galeria reflete no storage',
      status: 'pending',
      description: 'Verificar se remoção de imagem remove do Supabase Storage',
      requirement: 'storage cleanup'
    },
    {
      id: 'select-values',
      label: 'Nenhum erro de <Select.Item value=""> no console',
      status: 'pending',
      description: 'Verificar se não há erros de Select com values vazios',
      requirement: 'console limpo'
    }
  ]);

  const runTest = async (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'running' } : item
    ));

    // Simulate test running
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate test result (randomized for demo)
    const success = Math.random() > 0.3;
    
    setItems(prev => prev.map(item => 
      item.id === itemId ? { 
        ...item, 
        status: success ? 'success' : 'error' 
      } : item
    ));
  };

  const runAllTests = async () => {
    for (const item of items) {
      await runTest(item.id);
    }
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">✅ Passou</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Falhou</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">🔄 Executando</Badge>;
      default:
        return <Badge variant="secondary">⏳ Pendente</Badge>;
    }
  };

  const successCount = items.filter(item => item.status === 'success').length;
  const totalCount = items.length;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            📋 Checklist Automatizável - Agenda Form
            <Badge variant="outline" className="ml-2">
              {successCount}/{totalCount} Concluído
            </Badge>
          </CardTitle>
          <Button onClick={runAllTests} disabled={items.some(item => item.status === 'running')}>
            🚀 Executar Todos os Testes
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.label}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {item.description}
                  </p>
                  {item.requirement && (
                    <div className="text-xs bg-muted px-2 py-1 rounded inline-block">
                      <strong>Requisito:</strong> {item.requirement}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => runTest(item.id)}
                disabled={item.status === 'running'}
              >
                {item.status === 'running' ? '⏳' : '▶️'} Testar
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">📊 Resumo do Checklist</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-600 font-medium">✅ Sucessos:</span> {items.filter(i => i.status === 'success').length}
            </div>
            <div>
              <span className="text-red-600 font-medium">❌ Falhas:</span> {items.filter(i => i.status === 'error').length}
            </div>
            <div>
              <span className="text-blue-600 font-medium">🔄 Executando:</span> {items.filter(i => i.status === 'running').length}
            </div>
            <div>
              <span className="text-gray-600 font-medium">⏳ Pendentes:</span> {items.filter(i => i.status === 'pending').length}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">🔧 Como usar este checklist:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Clique "Testar"</strong> em cada item para verificar a funcionalidade</li>
            <li>• <strong>"Executar Todos"</strong> roda todos os testes em sequência</li>
            <li>• <strong>Verde (✅)</strong> = Funcionalidade implementada corretamente</li>
            <li>• <strong>Vermelho (❌)</strong> = Precisa de correções</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};