"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function DateTimePicker({
  name,
  label,
  placeholder = "Selecione data e hora",
  disabled,
  required,
  className,
}: DateTimePickerProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const [open, setOpen] = useState(false);
  const fieldError = errors[name];

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
          const selectedDate = field.value ? new Date(field.value) : undefined;
          
          const handleDateSelect = (date: Date | undefined) => {
            if (date) {
              // Keep existing time if available, otherwise set to current time
              const existingDate = selectedDate || new Date();
              const newDate = new Date(date);
              newDate.setHours(existingDate.getHours());
              newDate.setMinutes(existingDate.getMinutes());
              
              field.onChange(newDate.toISOString());
            } else {
              field.onChange("");
            }
          };

          const handleTimeChange = (timeString: string) => {
            if (!selectedDate) return;
            
            const [hours, minutes] = timeString.split(":").map(Number);
            const newDate = new Date(selectedDate);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            
            field.onChange(newDate.toISOString());
          };

          return (
            <div className="space-y-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                      className
                    )}
                    disabled={disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                    ) : (
                      <span>{placeholder}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                  
                  {selectedDate && (
                    <div className="p-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={format(selectedDate, "HH:mm")}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          className="w-24"
                        />
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          );
        }}
      />
      
      {fieldError && (
        <p className="text-sm text-destructive" role="alert">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}
