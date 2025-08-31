import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { MaskedInput } from "@/components/ui/masked-input";
import { cn } from "@/lib/utils";

interface RHFMaskedInputProps {
  name: string;
  label: string;
  mask: "cpf" | "cnpj" | "cpf-cnpj" | "cep" | "phone";
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export function RHFMaskedInput({
  name,
  label,
  mask,
  placeholder,
  description,
  required = false,
  className,
}: RHFMaskedInputProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className={cn(required && "after:content-['*'] after:text-destructive after:ml-1")}>
        {label}
      </Label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <MaskedInput
            {...field}
            id={name}
            mask={mask}
            placeholder={placeholder}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
          />
        )}
      />
      
      {description && !error && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}