import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, ArrowLeft, Calendar, Users, BookOpen, Settings, Star } from 'lucide-react';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';

interface UnderConstructionPageProps {
  title: string;
  description: string;
  expectedFeatures?: string[];
  breadcrumbItems?: Array<{ label: string; path?: string }>;
}

export function UnderConstructionPage({ 
  title, 
  description, 
  expectedFeatures = [],
  breadcrumbItems = []
}: UnderConstructionPageProps) {
  const navigate = useNavigate();

  const availableModules = [
    {
      name: 'Dashboard',
      path: '/admin-v3',
      icon: Calendar,
      status: '✅ Disponível'
    },
    {
      name: 'Agenda',
      path: '/admin-v3/agenda',
      icon: Calendar,
      status: '✅ Disponível'
    },
    {
      name: 'Artistas',
      path: '/admin-v3/agentes/artistas',
      icon: Users,
      status: '✅ Disponível'
    },
    {
      name: 'Revista',
      path: '#',
      icon: BookOpen,
      status: '🚧 Em desenvolvimento'
    },
    {
      name: 'Gestão',
      path: '#',
      icon: Settings,
      status: '🚧 Em desenvolvimento'
    },
    {
      name: 'Destaques',
      path: '#',
      icon: Star,
      status: '🚧 Em desenvolvimento'
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {breadcrumbItems.length > 0 && (
        <AdminV3Breadcrumb items={breadcrumbItems} />
      )}
      
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
            <Construction className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              {description}
            </p>
          </div>
        </div>

        {expectedFeatures.length > 0 && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Funcionalidades Planejadas</CardTitle>
              <CardDescription>
                Recursos que serão implementados nesta seção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {expectedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Módulos Disponíveis</CardTitle>
            <CardDescription>
              Explore as funcionalidades já implementadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableModules.map((module) => {
                const Icon = module.icon;
                const isAvailable = module.status.includes('✅');
                
                return (
                  <Button
                    key={module.name}
                    variant={isAvailable ? "outline" : "ghost"}
                    className={`h-auto p-3 justify-start ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => isAvailable && navigate(module.path)}
                    disabled={!isAvailable}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{module.name}</div>
                      <div className="text-xs text-muted-foreground">{module.status}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => navigate('/admin-v3')} variant="default">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <Button onClick={() => navigate('/admin-v3/agentes/artistas')} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Ver Artistas
          </Button>
        </div>
      </div>
    </div>
  );
}