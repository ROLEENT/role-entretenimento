import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RHFDateTimePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  showTime?: boolean;
  className?: string;
}

export const RHFDateTimePicker: React.FC<RHFDateTimePickerProps> = ({
  name,
  label,
  placeholder = "Selecione data e hora",
  description,
  disabled,
  required,
  showTime = true,
  className,
}) => {
  const { control } = useFormContext();

  const formatDateTime = (date: Date) => {
    if (!date || !isValid(date)) return '';
    
    if (showTime) {
      return format(date, "PPP 'às' HH:mm", { locale: ptBR });
    } else {
      return format(date, "PPP", { locale: ptBR });
    }
  };

  const parseTimeInput = (timeStr: string, currentDate: Date) => {
    try {
      const time = parse(timeStr, 'HH:mm', new Date());
      if (isValid(time)) {
        const newDate = new Date(currentDate);
        newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
        return newDate;
      }
    } catch (error) {
      console.warn('Invalid time format:', timeStr);
    }
    return currentDate;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="space-y-2">
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? formatDateTime(field.value) : placeholder}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        if (field.value) {
                          // Preserve existing time
                          const newDate = new Date(date);
                          newDate.setHours(
                            field.value.getHours(),
                            field.value.getMinutes(),
                            0,
                            0
                          );
                          field.onChange(newDate);
                        } else {
                          // Set default time to current time
                          const now = new Date();
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0);
                          field.onChange(date);
                        }
                      } else {
                        field.onChange(date);
                      }
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              {/* Time Input */}
              {showTime && field.value && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={format(field.value, 'HH:mm')}
                    onChange={(e) => {
                      const newDate = parseTimeInput(e.target.value, field.value);
                      field.onChange(newDate);
                    }}
                    className="w-32"
                    disabled={disabled}
                  />
                </div>
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