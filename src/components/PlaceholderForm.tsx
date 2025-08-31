import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface PlaceholderFormProps {
  title?: string;
  description?: string;
  className?: string;
}

export function PlaceholderForm({ 
  title = "Formulário em Reconstrução", 
  description = "Este formulário está sendo reconstruído com a nova arquitetura. Em breve estará disponível.",
  className 
}: PlaceholderFormProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default PlaceholderForm;