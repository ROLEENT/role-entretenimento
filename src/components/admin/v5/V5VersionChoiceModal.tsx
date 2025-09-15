import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Save, Zap } from 'lucide-react';
import { useV5Preferences, type V5Preference } from '@/hooks/useV5Preferences';
import { useV5Analytics } from '@/hooks/useV5Analytics';

interface V5VersionChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function V5VersionChoiceModal({ isOpen, onClose }: V5VersionChoiceModalProps) {
  const { setV5Preference, markChoiceModalShown } = useV5Preferences();
  const { trackEditClick } = useV5Analytics();
  const [selectedPreference, setSelectedPreference] = useState<V5Preference>(null);

  const handleSavePreference = () => {
    if (selectedPreference) {
      setV5Preference(selectedPreference);
      markChoiceModalShown();
      
      // Track the choice
      trackEditClick(
        selectedPreference === 'always-v5' ? 'v5' : 'v4',
        'preference_choice'
      );
    }
    onClose();
  };

  const features = {
    v5: [
      { icon: Save, text: 'Auto-save automático' },
      { icon: Zap, text: 'Interface mais rápida' },
      { icon: Clock, text: 'Quick Create modals' },
      { icon: Sparkles, text: 'UX modernizada' }
    ],
    v4: [
      { icon: Clock, text: 'Interface conhecida' },
      { icon: Save, text: 'Salvamento manual' }
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Escolha sua versão preferida
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* V5 Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedPreference === 'always-v5'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedPreference('always-v5')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Nova Versão V5</h3>
              <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Sparkles className="w-3 h-3 mr-1" />
                NOVO
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {features.v5.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <feature.icon className="h-4 w-4 text-primary" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Experiência otimizada com recursos modernos
            </p>
          </div>

          {/* V4 Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedPreference === 'always-v4'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedPreference('always-v4')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Versão Atual V4</h3>
              <Badge variant="secondary">ESTÁVEL</Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {features.v4.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <feature.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Interface familiar e testada
            </p>
          </div>
        </div>

        {/* Ask Each Time Option */}
        <div
          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
            selectedPreference === 'ask-each-time'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => setSelectedPreference('ask-each-time')}
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={selectedPreference === 'ask-each-time'}
              onChange={() => setSelectedPreference('ask-each-time')}
              className="text-primary"
            />
            <span className="font-medium">Perguntar a cada vez</span>
            <span className="text-sm text-muted-foreground">
              - Vou escolher manualmente quando editar
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Você pode alterar essa preferência a qualquer momento
          </p>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Pular
            </Button>
            <Button 
              onClick={handleSavePreference}
              disabled={!selectedPreference}
            >
              Salvar Preferência
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}