"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { format, addMinutes, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BaseFormFieldProps, toUTC, fromUTC, roundTo15Min } from "@/lib/forms";

interface RHFDateTimeUtcProps extends BaseFormFieldProps {
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
  timeZone?: string;
  compareWithField?: string; // Field name to compare with (for end date validation)
  isEndDate?: boolean; // Whether this is an end date field
}

export default function RHFDateTimeUtc({
  name,
  label,
  placeholder,
  description,
  disabled,
  required,
  className,
  showTime = true,
  minDate,
  maxDate,
  timeZone = "America/Sao_Paulo",
  compareWithField,
  isEndDate = false,
}: RHFDateTimeUtcProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const fieldError = errors[name];
  
  // Watch the comparison field if provided
  const compareValue = compareWithField ? watch(compareWithField) : null;

  const formatDateTimeLocal = (date: Date | null): string => {
    if (!date) return "";
    
    const localDate = fromUTC(date, timeZone);
    
    if (showTime) {
      return format(localDate, "yyyy-MM-dd'T'HH:mm", { locale: ptBR });
    }
    return format(localDate, "yyyy-MM-dd", { locale: ptBR });
  };

  const parseLocalToUtc = (dateTimeString: string): Date | null => {
    if (!dateTimeString) return null;
    
    const localDate = new Date(dateTimeString);
    if (isNaN(localDate.getTime())) return null;
    
    // Always round to 15 minutes for better UX
    const roundedDate = roundTo15Min(localDate);
    return toUTC(roundedDate, timeZone);
  };

  const getDisplayValue = (utcDate: Date | null): string => {
    if (!utcDate) return "";
    
    const localDate = fromUTC(utcDate, timeZone);
    
    if (showTime) {
      return format(localDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
    return format(localDate, "dd/MM/yyyy", { locale: ptBR });
  };

  // Validation function for date comparison
  const validateDateComparison = (currentValue: Date | null): string | null => {
    if (!currentValue || !compareValue || !isEndDate) return null;
    
    const diffMinutes = differenceInMinutes(currentValue, compareValue);
    
    if (diffMinutes < 15) {
      return "A data/hora de fim deve ser pelo menos 15 minutos após o início";
    }
    
    return null;
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const validationError = validateDateComparison(field.value);
          
          return (
            <div className="space-y-2">
              {/* Main datetime input */}
              <Input
                type="datetime-local"
                value={formatDateTimeLocal(field.value)}
                onChange={(e) => {
                  const utcDate = parseLocalToUtc(e.target.value);
                  field.onChange(utcDate);
                }}
                step="900" // 15 minutes in seconds
                disabled={disabled}
                min={minDate ? formatDateTimeLocal(minDate) : undefined}
                max={maxDate ? formatDateTimeLocal(maxDate) : undefined}
                className={className}
                aria-invalid={!!(fieldError || validationError)}
                aria-describedby={description ? `${name}-description` : undefined}
                aria-required={required}
              />
              
              {/* Date comparison warning */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
              
              {/* Display value for better UX */}
              {field.value && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {showTime ? <Clock size={14} /> : <Calendar size={14} />}
                  <span>{getDisplayValue(field.value)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => field.onChange(null)}
                    disabled={disabled}
                    className="h-auto p-1 text-xs"
                  >
                    Limpar
                  </Button>
                </div>
              )}
            </div>
          );
        }}
      />
      
      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {fieldError && (
        <p className="text-sm text-destructive" role="alert">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}