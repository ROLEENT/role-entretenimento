import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle } from 'lucide-react';

const AdminPasswordUpdateMock = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Admin Configurado</CardTitle>
          <p className="text-muted-foreground">
            Sistema admin funcionando sem autenticação
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 mb-1">Status do Sistema:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ Acesso direto ao admin</li>
              <li>✅ Todas as funcionalidades disponíveis</li>
              <li>✅ Sem necessidade de senha</li>
            </ul>
          </div>

          <Button 
            onClick={() => navigate('/admin')} 
            className="w-full"
          >
            Acessar Painel Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPasswordUpdateMock;