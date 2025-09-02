import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseFormFieldProps } from "@/lib/forms";
import { useAgentesInstagramValidation } from "@/hooks/useAgentesInstagramValidation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface InstagramFieldProps extends BaseFormFieldProps {
  agentType: 'artist' | 'organizer' | 'venue';
  agentId?: string;
}

export function InstagramField({
  name,
  label,
  placeholder,
  description,
  disabled,
  required,
  className,
  agentType,
  agentId,
}: InstagramFieldProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const instagramValue = watch(name) || "";
  
  const { isValidatingInstagram, instagramStatus } = useAgentesInstagramValidation({
    instagram: instagramValue,
    agentType,
    agentId,
    enabled: !!instagramValue && instagramValue.length > 0,
  });

  const fieldError = errors[name];

  const getValidationIcon = () => {
    if (!instagramValue) return null;
    if (isValidatingInstagram) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (instagramStatus === "available") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (instagramStatus === "taken") return <XCircle className="h-4 w-4 text-destructive" />;
    return null;
  };

  const getValidationMessage = () => {
    if (!instagramValue || isValidatingInstagram) return null;
    if (instagramStatus === "available") return "Instagram disponível";
    if (instagramStatus === "taken") return "Este Instagram já está em uso";
    return null;
  };

  const validationMessageColor = instagramStatus === "available" ? "text-green-600" : "text-destructive";

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={name}
              type="text"
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              aria-invalid={!!fieldError}
              aria-describedby={description ? `${name}-description` : undefined}
              aria-required={required}
            />
          )}
        />
        {getValidationIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>
      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {getValidationMessage() && (
        <p className={`text-sm ${validationMessageColor}`}>
          {getValidationMessage()}
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