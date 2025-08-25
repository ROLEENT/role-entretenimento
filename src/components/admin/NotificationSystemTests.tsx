import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Play, Settings, Users } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export function NotificationSystemTests() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const { 
    supported, 
    permission, 
    subscription, 
    requestPermission, 
    subscribe, 
    sendNotification 
  } = usePushNotifications();

  // Verificar status do sistema
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const [subscriptions, cronJobs, profiles] = await Promise.all([
        supabase.from('push_subscriptions').select('*').limit(10),
        supabase.rpc('list_notification_cron_jobs'),
        supabase.from('profiles').select('id').limit(10)
      ]);

      setSystemStatus({
        subscriptions: subscriptions.data?.length || 0,
        cronJobs: cronJobs.data?.length || 0,
        profiles: profiles.data?.length || 0,
        supported,
        permission,
        subscription
      });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const updateTestResult = (name: string, updates: Partial<TestResult>) => {
    setTestResults(prev => 
      prev.map(test => 
        test.name === name ? { ...test, ...updates } : test
      )
    );
  };

  const addTestResult = (test: TestResult) => {
    setTestResults(prev => [...prev, test]);
  };

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTestResult(testName, { status: 'running' });
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, { 
        status: 'success', 
        message: `Concluído em ${duration}ms`,
        duration 
      });
    } catch (error: any) {
      updateTestResult(testName, { 
        status: 'error', 
        message: error.message 
      });
      console.error(`Erro no teste ${testName}:`, error);
    }
  };

  // Teste 1: Verificar permissões e suporte
  const testBrowserSupport = async () => {
    if (!supported) {
      throw new Error('Push notifications não suportadas neste navegador');
    }
    
    if (permission === 'denied') {
      throw new Error('Permissões negadas pelo usuário');
    }
    
    if (permission === 'default') {
      const granted = await requestPermission();
      if (!granted) {
        throw new Error('Usuário recusou permissões');
      }
    }
  };

  // Teste 2: Testar inscrição
  const testSubscription = async () => {
    if (!subscription) {
      const success = await subscribe();
      if (!success) {
        throw new Error('Falha ao se inscrever para notificações');
      }
    }
    await checkSystemStatus(); // Atualizar contadores
  };

  // Teste 3: Testar envio manual
  const testManualSend = async () => {
    await sendNotification({
      title: 'Teste do Sistema',
      body: 'Esta é uma notificação de teste do sistema de push notifications',
      targetAll: true
    });
  };

  // Teste 4: Testar trigger de novo evento
  const testNewEventTrigger = async () => {
    const { error } = await supabase.functions.invoke('notify-new-event', {
      body: {
        event_id: 'test-event-id',
        title: 'Evento de Teste',
        city: 'São Paulo',
        date_start: new Date().toISOString(),
        venue: 'Local de Teste'
      }
    });
    
    if (error) {
      throw new Error(`Erro ao testar trigger: ${error.message}`);
    }
  };

  // Teste 5: Testar resposta de comentário
  const testCommentReplyTrigger = async () => {
    const { error } = await supabase.functions.invoke('notify-comment-reply', {
      body: {
        parent_comment_id: 'test-comment-id',
        replier_user_id: 'test-user-id',
        content: 'Resposta de teste',
        entity_type: 'event',
        entity_id: 'test-event-id'
      }
    });
    
    if (error) {
      throw new Error(`Erro ao testar resposta: ${error.message}`);
    }
  };

  // Executar todos os testes
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      { name: 'Suporte do Navegador', fn: testBrowserSupport },
      { name: 'Inscrição Push', fn: testSubscription },
      { name: 'Envio Manual', fn: testManualSend },
      { name: 'Trigger Novo Evento', fn: testNewEventTrigger },
      { name: 'Trigger Resposta Comentário', fn: testCommentReplyTrigger }
    ];

    // Inicializar resultados
    tests.forEach(test => {
      addTestResult({ name: test.name, status: 'pending' });
    });

    // Executar testes sequencialmente
    for (const test of tests) {
      await runTest(test.name, test.fn);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre testes
    }

    setIsRunning(false);
    toast.success('Testes concluídos!');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      success: 'default',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status === 'running' ? 'executando' : status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status do Sistema de Notificações
          </CardTitle>
          <CardDescription>
            Verificação automática do estado atual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{systemStatus.subscriptions}</div>
                <div className="text-sm text-muted-foreground">Subscrições Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{systemStatus.cronJobs}</div>
                <div className="text-sm text-muted-foreground">Cron Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{systemStatus.profiles}</div>
                <div className="text-sm text-muted-foreground">Usuários</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {systemStatus.supported ? '✅' : '❌'}
                </div>
                <div className="text-sm text-muted-foreground">Suporte Push</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Testes Automáticos
          </CardTitle>
          <CardDescription>
            Execute testes completos do sistema de notificações push
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Executando Testes...' : 'Executar Todos os Testes'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados dos Testes:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.message && (
                      <span className="text-sm text-muted-foreground">
                        {result.message}
                      </span>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">Testes Manuais</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Testes Manuais Individuais</CardTitle>
              <CardDescription>
                Execute testes específicos individualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                onClick={() => runTest('Suporte do Navegador', testBrowserSupport)}
                className="w-full justify-start"
              >
                Testar Suporte do Navegador
              </Button>
              <Button 
                variant="outline" 
                onClick={() => runTest('Inscrição', testSubscription)}
                className="w-full justify-start"
              >
                Testar Inscrição Push
              </Button>
              <Button 
                variant="outline" 
                onClick={() => runTest('Envio Manual', testManualSend)}
                className="w-full justify-start"
              >
                Testar Envio Manual
              </Button>
              <Button 
                variant="outline" 
                onClick={() => runTest('Trigger Evento', testNewEventTrigger)}
                className="w-full justify-start"
              >
                Testar Trigger Novo Evento
              </Button>
              <Button 
                variant="outline" 
                onClick={() => runTest('Trigger Comentário', testCommentReplyTrigger)}
                className="w-full justify-start"
              >
                Testar Trigger Comentário
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento do Sistema</CardTitle>
              <CardDescription>
                Links para logs e dashboard do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Status Atual</h4>
                <div className="space-y-1 text-sm">
                  <div>Push Notifications: {supported ? '✅ Suportado' : '❌ Não Suportado'}</div>
                  <div>Permissão: {permission}</div>
                  <div>Inscrito: {subscription ? '✅ Sim' : '❌ Não'}</div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={checkSystemStatus}
                className="w-full justify-start"
              >
                Atualizar Status do Sistema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}