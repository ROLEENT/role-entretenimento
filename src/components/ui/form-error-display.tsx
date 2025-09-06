import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { FieldErrors } from 'react-hook-form';

interface FormErrorDisplayProps {
  errors: FieldErrors;
  className?: string;
}

export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ 
  errors, 
  className = "" 
}) => {
  const errorMessages = Object.entries(errors)
    .filter(([_, error]) => error?.message)
    .map(([field, error]) => `${field}: ${error.message}`);

  if (errorMessages.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-medium">Erros de validação:</p>
          <ul className="list-disc list-inside space-y-1">
            {errorMessages.map((message, index) => (
              <li key={index} className="text-sm">{message}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};