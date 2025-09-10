import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EntityFormShellProps {
  title: string;
  subtitle: string;
  backUrl: string;
  isEditing?: boolean;
  isLoading?: boolean;
  isDirty?: boolean;
  onSave: () => void;
  onBack: () => void;
  onPreview?: () => void;
  completionScore?: number;
  children: React.ReactNode;
}

export const EntityFormShell: React.FC<EntityFormShellProps> = ({
  title,
  subtitle,
  backUrl,
  isEditing = false,
  isLoading = false,
  isDirty = false,
  onSave,
  onBack,
  onPreview,
  completionScore,
  children
}) => {
  const getCompletionColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCompletionText = (score: number) => {
    if (score >= 80) return 'Completo';
    if (score >= 60) return 'Quase completo';
    return 'Incompleto';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{title}</h1>
              {completionScore !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <div 
                    className={`w-2 h-2 rounded-full ${getCompletionColor(completionScore)}`}
                  />
                  {getCompletionText(completionScore)} ({completionScore}%)
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button
              variant="outline"
              onClick={onPreview}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          
          <Button
            onClick={onSave}
            disabled={isLoading || !isDirty}
            className="min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Informações do {isEditing ? 'Perfil' : 'Novo Perfil'}
            {isDirty && (
              <Badge variant="outline" className="text-xs">
                Alterações não salvas
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};