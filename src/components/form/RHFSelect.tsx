"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface RHFSelectProps {
  name: string;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  parseValue?: (value: string) => any;
  serializeValue?: (value: any) => string;
}

export default function RHFSelect({
  name,
  options,
  label,
  placeholder = "Selecione...",
  disabled,
  className,
  parseValue,
  serializeValue,
}: RHFSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={(value) => {
              const parsedValue = parseValue ? parseValue(value) : value;
              field.onChange(parsedValue);
            }}
            value={serializeValue ? serializeValue(field.value) : field.value}
            disabled={disabled}
          >
            <SelectTrigger className={className} aria-invalid={!!fieldError}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper" className="z-50">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}