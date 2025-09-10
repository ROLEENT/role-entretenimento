import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RHFDocumentInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'cpf' | 'cnpj' | 'auto';
  className?: string;
}

export const RHFDocumentInput: React.FC<RHFDocumentInputProps> = ({
  name,
  label,
  placeholder,
  description,
  disabled,
  required,
  type = 'auto',
  className,
}) => {
  const { control } = useFormContext();

  const formatDocument = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'cpf' || (type === 'auto' && numbers.length <= 11)) {
      // CPF format: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      // CNPJ format: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  };

  const validateDocument = (value: string) => {
    if (!value) return true;
    
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'cpf' || (type === 'auto' && numbers.length === 11)) {
      return validateCPF(numbers);
    } else if (type === 'cnpj' || (type === 'auto' && numbers.length === 14)) {
      return validateCNPJ(numbers);
    }
    
    return type === 'auto' ? 'Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos' : 'Documento inválido';
  };

  const validateCPF = (cpf: string) => {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return 'CPF inválido';
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return 'CPF inválido';
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return 'CPF inválido';
    
    return true;
  };

  const validateCNPJ = (cnpj: string) => {
    if (cnpj.length !== 14) return 'CNPJ inválido';
    
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(cnpj.charAt(12))) return 'CNPJ inválido';
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit2 !== parseInt(cnpj.charAt(13))) return 'CNPJ inválido';
    
    return true;
  };

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    if (type === 'cpf') return '000.000.000-00';
    if (type === 'cnpj') return '00.000.000/0000-00';
    return 'CPF ou CNPJ';
  };

  const getLabelText = () => {
    if (label) return label;
    if (type === 'cpf') return 'CPF';
    if (type === 'cnpj') return 'CNPJ';
    return 'CPF/CNPJ';
  };

  return (
    <FormField
      control={control}
      name={name}
      rules={{
        validate: validateDocument,
      }}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {getLabelText()}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={getPlaceholderText()}
              disabled={disabled}
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                const formatted = formatDocument(e.target.value);
                field.onChange(formatted);
              }}
            />
          </FormControl>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};