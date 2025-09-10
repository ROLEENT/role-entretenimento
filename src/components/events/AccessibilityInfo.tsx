import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accessibility, 
  Volume2, 
  Users, 
  Car,
  Info
} from 'lucide-react';

interface AccessibilityInfoProps {
  event: any;
  venue?: any;
}

export function AccessibilityInfo({ event, venue }: AccessibilityInfoProps) {
  const accessibility = event.accessibility || venue?.accessibility || {};
  
  // Check if there's any accessibility information
  const hasAccessibilityInfo = Object.keys(accessibility).length > 0;
  
  if (!hasAccessibilityInfo) {
    return null;
  }

  const accessibilityFeatures = [
    {
      key: 'wheelchair_accessible',
      icon: Accessibility,
      label: 'Acesso para cadeirantes',
      description: 'Local com rampa de acesso e banheiro adaptado'
    },
    {
      key: 'hearing_assistance',
      icon: Volume2,
      label: 'Assistência auditiva',
      description: 'Intérprete de Libras disponível'
    },
    {
      key: 'companion_allowed',
      icon: Users,
      label: 'Acompanhante gratuito',
      description: 'Pessoas com deficiência têm direito a acompanhante'
    },
    {
      key: 'parking_available',
      icon: Car,
      label: 'Estacionamento adaptado',
      description: 'Vagas reservadas próximas à entrada'
    }
  ];

  const availableFeatures = accessibilityFeatures.filter(
    feature => accessibility[feature.key] === true
  );

  if (availableFeatures.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Accessibility className="h-5 w-5 text-primary" />
          Acessibilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.key} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{feature.label}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
        
        {/* Additional notes */}
        {accessibility.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{accessibility.notes}</p>
            </div>
          </div>
        )}
        
        {/* Age rating and policies */}
        {event.age_rating && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-sm text-blue-900 mb-1">Classificação Etária</h5>
            <p className="text-sm text-blue-700">
              {event.age_rating === 'all_ages' && 'Livre para todas as idades'}
              {event.age_rating === 'teen' && 'A partir de 14 anos'}
              {event.age_rating === 'adult' && 'Apenas maiores de 18 anos'}
            </p>
            {event.age_notes && (
              <p className="text-xs text-blue-600 mt-1">{event.age_notes}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}