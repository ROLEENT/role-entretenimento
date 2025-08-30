import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Check, X } from 'lucide-react';
import { useSlugValidation } from '@/hooks/useSlugValidation';
import { cn } from '@/lib/utils';

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  sourceText?: string;
  table: 'agenda_itens' | 'artists' | 'venues' | 'organizers';
  excludeId?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SlugInput: React.FC<SlugInputProps> = ({
  value,
  onChange,
  sourceText,
  table,
  excludeId,
  label = "Slug (URL)",
  placeholder = "meu-slug-unico",
  disabled = false,
  className = ""
}) => {
  const { available, loading, error, checkSlug, generateSlug } = useSlugValidation(table);
  const [hasBeenModified, setHasBeenModified] = useState(false);

  // Auto-generate slug from source text
  useEffect(() => {
    if (sourceText && !hasBeenModified && !value) {
      const generated = generateSlug(sourceText);
      if (generated && generated !== value) {
        onChange(generated);
      }
    }
  }, [sourceText, hasBeenModified, value, onChange, generateSlug]);

  // Check slug availability when it changes
  useEffect(() => {
    if (value && value.length >= 3) {
      const timer = setTimeout(() => {
        checkSlug(value, excludeId);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [value, excludeId, checkSlug]);

  const handleChange = (newValue: string) => {
    setHasBeenModified(true);
    // Only allow valid slug characters
    const sanitized = newValue
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    onChange(sanitized);
  };

  const handleGenerate = () => {
    if (sourceText) {
      const generated = generateSlug(sourceText);
      if (generated) {
        onChange(generated);
        setHasBeenModified(true);
      }
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <X className="w-4 h-4 text-destructive" />;
    if (value && value.length >= 3 && available) return <Check className="w-4 h-4 text-green-600" />;
    if (value && value.length >= 3 && !available) return <X className="w-4 h-4 text-destructive" />;
    return null;
  };

  const getStatusText = () => {
    if (loading) return "Verificando...";
    if (error) return error;
    if (value && value.length >= 3 && available) return "Disponível";
    if (value && value.length >= 3 && !available) return "Já está em uso";
    if (value && value.length < 3) return "Mínimo 3 caracteres";
    return "";
  };

  const getStatusColor = () => {
    if (loading) return "text-muted-foreground";
    if (error || (value && value.length >= 3 && !available)) return "text-destructive";
    if (value && value.length >= 3 && available) return "text-green-600";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="slug-input">{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="slug-input"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pr-10",
              value && value.length >= 3 && !available && "border-destructive",
              value && value.length >= 3 && available && "border-green-600"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
        {sourceText && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGenerate}
            disabled={disabled}
            title="Gerar slug automaticamente"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
      {getStatusText() && (
        <p className={cn("text-sm", getStatusColor())}>
          {getStatusText()}
        </p>
      )}
    </div>
  );
};