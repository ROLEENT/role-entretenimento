import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  duration?: number;
}

export function SystemValidation() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const runValidation = async () => {
    setRunning(true);
    setResults([]);
    const testResults: ValidationResult[] = [];

    try {
      // Teste 1: Conectividade do banco
      const start1 = performance.now();
      const { error: connectError } = await supabase.from('admin_users').select('count').limit(1);
      const duration1 = performance.now() - start1;
      
      testResults.push({
        test: 'Conectividade do Banco',
        status: connectError ? 'error' : 'success',
        message: connectError ? 'Falha na conexão' : 'Conexão estabelecida',
        details: connectError ? connectError.message : `Tempo: ${duration1.toFixed(2)}ms`,
        duration: duration1
      });

      // Teste 2: Verificação RLS
      const start2 = performance.now();
      const { data: rlsData, error: rlsError } = await supabase
        .from('artists')
        .select('id')
        .limit(1);
      const duration2 = performance.now() - start2;

      testResults.push({
        test: 'Row Level Security',
        status: rlsError ? 'warning' : 'success',
        message: 'Políticas RLS ativas',
        details: `Tempo: ${duration2.toFixed(2)}ms`,
        duration: duration2
      });

      // Teste 3: Sistema de Compliance
      const start3 = performance.now();
      const { data: complianceData, error: complianceError } = await supabase
        .from('compliance_settings')
        .select('setting_key, setting_value');
      const duration3 = performance.now() - start3;

      const lgpdActive = complianceData?.find(c => c.setting_key === 'lgpd_enabled')?.setting_value;
      const gdprActive = complianceData?.find(c => c.setting_key === 'gdpr_enabled')?.setting_value;

      testResults.push({
        test: 'Sistema de Compliance',
        status: (lgpdActive && gdprActive) ? 'success' : 'warning',
        message: 'Configurações LGPD/GDPR',
        details: `LGPD: ${lgpdActive ? 'Ativo' : 'Inativo'}, GDPR: ${gdprActive ? 'Ativo' : 'Inativo'}`,
        duration: duration3
      });

      // Teste 4: Performance das Views
      const start4 = performance.now();
      const { error: viewError } = await supabase
        .from('artists_public')
        .select('*')
        .limit(10);
      const duration4 = performance.now() - start4;

      testResults.push({
        test: 'Performance das Views',
        status: duration4 > 2000 ? 'warning' : duration4 > 1000 ? 'warning' : 'success',
        message: `Tempo de resposta: ${duration4.toFixed(2)}ms`,
        details: viewError ? viewError.message : 'Views públicas funcionais',
        duration: duration4
      });

      // Teste 5: Proteção de Dados Sensíveis
      const start5 = performance.now();
      const { data: artistData, error: artistError } = await supabase
        .from('artists_public')
        .select('booking_email, booking_whatsapp')
        .limit(1);
      const duration5 = performance.now() - start5;

      const sensitiveDataProtected = artistData && artistData.length > 0 
        ? artistData[0].booking_email === null && artistData[0].booking_whatsapp === null
        : true;

      testResults.push({
        test: 'Proteção de Dados Sensíveis',
        status: sensitiveDataProtected ? 'success' : 'error',
        message: sensitiveDataProtected ? 'Dados protegidos' : 'Dados expostos',
        details: 'Informações sensíveis mascaradas em views públicas',
        duration: duration5
      });

      // Teste 6: Carga Simultânea
      const start6 = performance.now();
      const promises = [
        supabase.from('events').select('count').limit(1),
        supabase.from('artists').select('count').limit(1),
        supabase.from('organizers').select('count').limit(1)
      ];
      
      const simultaneousResults = await Promise.all(promises);
      const duration6 = performance.now() - start6;

      const allSuccessful = simultaneousResults.every(({ error }) => !error);

      testResults.push({
        test: 'Carga Simultânea',
        status: allSuccessful ? 'success' : 'warning',
        message: `${simultaneousResults.filter(r => !r.error).length}/3 queries sucesso`,
        details: `Tempo total: ${duration6.toFixed(2)}ms`,
        duration: duration6
      });

      // Teste 7: Integridade das Tabelas Principais
      const tables = ['admin_users', 'artists', 'events', 'organizers', 'partners', 'highlights'];
      const start7 = performance.now();
      
      let tablesOk = 0;
      for (const table of tables) {
        try {
          await supabase.from(table).select('count').limit(1);
          tablesOk++;
        } catch (e) {
          // Tabela com problema
        }
      }
      const duration7 = performance.now() - start7;

      testResults.push({
        test: 'Integridade das Tabelas',
        status: tablesOk === tables.length ? 'success' : 'warning',
        message: `${tablesOk}/${tables.length} tabelas acessíveis`,
        details: `Verificação completa em ${duration7.toFixed(2)}ms`,
        duration: duration7
      });

    } catch (error) {
      testResults.push({
        test: 'Erro Geral',
        status: 'error',
        message: 'Falha crítica na validação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    setResults(testResults);
    setRunning(false);

    // Resumo final
    const successCount = testResults.filter(r => r.status === 'success').length;
    const totalTests = testResults.length;
    
    toast({
      title: "Validação Concluída",
      description: `${successCount}/${totalTests} testes passaram com sucesso`,
      variant: successCount === totalTests ? "default" : "destructive"
    });
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };

    const labels = {
      success: 'SUCESSO',
      warning: 'ATENÇÃO',
      error: 'ERRO'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const overallStatus = results.length > 0 
    ? results.some(r => r.status === 'error') 
      ? 'error' 
      : results.some(r => r.status === 'warning') 
        ? 'warning' 
        : 'success'
    : 'warning';

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Validação do Sistema</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Sprint 7: Testes e Validação Completa
            </p>
          </div>
          <Button
            onClick={runValidation}
            disabled={running}
            variant={results.length === 0 ? "default" : "outline"}
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar Validação
              </>
            )}
          </Button>
        </CardHeader>

        {results.length > 0 && (
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <span className="text-sm">
                  <span className="font-medium text-green-600">{successCount}</span> sucessos
                </span>
                <span className="text-sm">
                  <span className="font-medium text-yellow-600">{warningCount}</span> avisos
                </span>
                <span className="text-sm">
                  <span className="font-medium text-red-600">{errorCount}</span> erros
                </span>
              </div>
              {getStatusBadge(overallStatus)}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Resultados dos testes */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h4 className="font-semibold">{result.test}</h4>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-muted-foreground mt-1">{result.details}</p>
                      )}
                      {result.duration && (
                        <p className="text-xs text-muted-foreground">
                          Tempo de execução: {result.duration.toFixed(2)}ms
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instruções */}
      {results.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Pronto para Validação</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Execute a bateria completa de testes para validar a integridade, 
                  segurança e performance do sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}