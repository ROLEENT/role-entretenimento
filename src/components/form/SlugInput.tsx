import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlugInputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  error?: string;
  disabled?: boolean;
  locked?: boolean;
  required?: boolean;
  className?: string;
  statusIcon?: React.ReactNode;
  description?: string;
  regenerateDisabled?: boolean;
}

export function SlugInput({
  id,
  name,
  label,
  placeholder,
  value = '',
  onChange,
  onBlur,
  onRegenerate,
  onEdit,
  error,
  disabled,
  locked,
  required,
  className,
  statusIcon,
  description,
  regenerateDisabled,
}: SlugInputProps) {
  const handleInputClick = () => {
    if (!locked && onEdit) {
      onEdit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}
      <div className="relative flex gap-2">
        <div className="flex-1 relative">
          <Input
            id={id}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            onClick={handleInputClick}
            disabled={disabled}
            readOnly={!locked}
            className={cn(
              error && "border-destructive",
              !locked && "cursor-pointer bg-muted/50",
              "pr-8"
            )}
          />
          {statusIcon && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {statusIcon}
            </div>
          )}
          {locked && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <Lock className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={regenerateDisabled}
          title="Regenerar slug a partir do nome"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}