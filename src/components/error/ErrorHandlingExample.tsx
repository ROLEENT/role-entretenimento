import React from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useValidatedForm } from '@/hooks/useValidatedForm';
import { ErrorDisplay } from '@/components/error/ErrorDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

// Example schema for testing
const testSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
});

// Example component demonstrating error handling
export const ErrorHandlingExample: React.FC = () => {
  const errorHandler = useErrorHandler();

  const form = useValidatedForm({
    schema: testSchema,
    defaultValues: { email: '', name: '' },
    onSubmit: async (data) => {
      // Simulate random errors for demonstration
      const random = Math.random();
      
      if (random < 0.3) {
        throw new Error('Simulated network error');
      } else if (random < 0.6) {
        throw { status: 401, message: 'Unauthorized access' };
      } else if (random < 0.8) {
        throw { name: 'ValidationError', errors: [{ message: 'Invalid data' }] };
      }
      
      // Success case
      console.log('Form submitted successfully:', data);
    },
  });

  const simulateError = (type: string) => {
    switch (type) {
      case 'network':
        errorHandler.handleError(new Error('Network connection failed'), { source: 'manual_test' });
        break;
      case 'validation':
        errorHandler.handleError(
          { errors: [{ path: ['email'], message: 'Email já existe' }] },
          { source: 'manual_test' }
        );
        break;
      case 'auth':
        errorHandler.handleError(
          { status: 401, message: 'Session expired' },
          { source: 'manual_test' }
        );
        break;
      case 'critical':
        throw new Error('Critical error for boundary testing');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demonstração do Sistema de Error Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error simulation buttons */}
          <div className="space-y-2">
            <h3 className="font-medium">Simular Erros:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => simulateError('network')} 
                variant="outline" 
                size="sm"
              >
                Erro de Rede
              </Button>
              <Button 
                onClick={() => simulateError('validation')} 
                variant="outline" 
                size="sm"
              >
                Erro de Validação
              </Button>
              <Button 
                onClick={() => simulateError('auth')} 
                variant="outline" 
                size="sm"
              >
                Erro de Autenticação
              </Button>
              <Button 
                onClick={() => simulateError('critical')} 
                variant="destructive" 
                size="sm"
              >
                Erro Crítico (Boundary)
              </Button>
            </div>
          </div>

          {/* Form example with error handling */}
          <div className="space-y-4">
            <h3 className="font-medium">Formulário com Validação:</h3>
            <form onSubmit={form.submitHandler} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </form>
          </div>

          {/* Error display */}
          {errorHandler.hasErrors && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Erros Capturados:</h3>
                <Button 
                  onClick={errorHandler.clearErrors} 
                  variant="ghost" 
                  size="sm"
                >
                  Limpar Todos
                </Button>
              </div>
              
              <div className="space-y-2">
                {errorHandler.errors.slice(0, 3).map((error) => (
                  <ErrorDisplay
                    key={error.id}
                    error={error}
                    onDismiss={() => errorHandler.clearError(error.id)}
                    onRetry={errorHandler.retryLastError}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 border rounded">
              <div className="text-2xl font-bold">{errorHandler.errorCount}</div>
              <div className="text-sm text-muted-foreground">Total de Erros</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-bold">
                {errorHandler.getErrorsByCategory('network').length}
              </div>
              <div className="text-sm text-muted-foreground">Erros de Rede</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-bold">
                {errorHandler.getErrorsBySeverity('high').length}
              </div>
              <div className="text-sm text-muted-foreground">Alta Severidade</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-bold">
                {errorHandler.errors.filter(e => e.retryable).length}
              </div>
              <div className="text-sm text-muted-foreground">Podem Retentar</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};