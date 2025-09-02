import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Plus, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProfileGeneration, AgentData, ProfileType } from '@/hooks/useProfileGeneration';

interface ProfileGenerationButtonProps {
  agentData: AgentData;
  agentType: ProfileType;
  onProfileGenerated?: (profileHandle: string) => void;
}

export const ProfileGenerationButton: React.FC<ProfileGenerationButtonProps> = ({
  agentData,
  agentType,
  onProfileGenerated,
}) => {
  const {
    existingProfile,
    isCheckingProfile,
    generateProfile,
    isGenerating,
    hasProfile,
  } = useProfileGeneration(agentData.id, agentType);

  const handleGenerateProfile = () => {
    generateProfile(agentData, {
      onSuccess: (profile) => {
        onProfileGenerated?.(profile.handle);
      },
    });
  };

  if (isCheckingProfile) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <span className="text-sm text-muted-foreground">Verificando perfil...</span>
      </div>
    );
  }

  if (hasProfile && existingProfile) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Perfil Criado
        </Badge>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center gap-1"
        >
          <a 
            href={`/perfis/${existingProfile.handle}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3 w-3" />
            Ver Perfil
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline">
        Perfil: Não criado
      </Badge>
      <Button
        onClick={handleGenerateProfile}
        disabled={isGenerating}
        size="sm"
        className="flex items-center gap-1"
      >
        {isGenerating ? (
          <>
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
            {hasProfile ? 'Atualizando...' : 'Gerando...'}
          </>
        ) : (
          <>
            <Plus className="h-3 w-3" />
            {hasProfile ? 'Atualizar Perfil' : 'Gerar Perfil'}
          </>
        )}
      </Button>
    </div>
  );
};