import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface RHFMarkdownEditorProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minLength?: number;
  description?: string;
}

export function RHFMarkdownEditor({
  name,
  label,
  placeholder = "Escreva o conteúdo em Markdown...",
  disabled = false,
  minLength,
  description,
}: RHFMarkdownEditorProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const fieldError = errors[name];
  const currentValue = watch(name) || "";
  const charCount = currentValue.length;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
            {label}
          </Label>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {charCount} caracteres
            </Badge>
            {minLength && (
              <Badge 
                variant={charCount >= minLength ? "default" : "destructive"}
                className="text-xs"
              >
                Mín: {minLength}
              </Badge>
            )}
          </div>
        </div>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[200px] font-mono text-sm"
            aria-invalid={!!fieldError}
          />
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