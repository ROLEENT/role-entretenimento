"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RHFSwitchProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export default function RHFSwitch({
  name,
  label,
  description,
  disabled,
  className,
}: RHFSwitchProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];

  return (
    <div className="space-y-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={`flex items-center space-x-2 ${className}`}>
            <Switch
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!fieldError}
            />
            {label && (
              <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
                {label}
              </Label>
            )}
          </div>
        )}
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}