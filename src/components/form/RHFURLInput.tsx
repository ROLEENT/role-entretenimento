import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RHFURLInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  allowedDomains?: string[];
  showPreview?: boolean;
  className?: string;
}

export const RHFURLInput: React.FC<RHFURLInputProps> = ({
  name,
  label,
  placeholder = "https://exemplo.com",
  description,
  disabled,
  required,
  allowedDomains,
  showPreview = true,
  className,
}) => {
  const { control } = useFormContext();

  const validateURL = (value: string) => {
    if (!value) return true;
    
    try {
      const url = new URL(value);
      
      // Check if protocol is http or https
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'URL deve começar com http:// ou https://';
      }
      
      // Check allowed domains if specified
      if (allowedDomains && allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => 
          url.hostname.includes(domain) || url.hostname.endsWith(domain)
        );
        if (!isAllowed) {
          return `URL deve ser de um dos domínios: ${allowedDomains.join(', ')}`;
        }
      }
      
      return true;
    } catch {
      return 'URL inválida';
    }
  };

  const formatURL = (value: string) => {
    if (!value) return '';
    
    // Add protocol if missing
    if (value && !value.match(/^https?:\/\//)) {
      return `https://${value}`;
    }
    
    return value;
  };

  return (
    <FormField
      control={control}
      name={name}
      rules={{
        validate: validateURL,
      }}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  const formatted = formatURL(e.target.value);
                  field.onChange(formatted);
                  field.onBlur();
                }}
                className="pr-10"
              />
              {field.value && showPreview && (
                <a
                  href={field.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
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