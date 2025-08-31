"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSlugValidation } from "@/hooks/useSlugValidation";

interface RHFSlugProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  table: string;
  currentId?: string;
  generateFrom?: string; // field name to generate slug from
}

export default function RHFSlug({
  name,
  label,
  placeholder,
  disabled,
  table,
  currentId,
  generateFrom,
}: RHFSlugProps) {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const fieldError = errors[name];
  const slugValue = watch(name);
  const sourceValue = generateFrom ? watch(generateFrom) : "";
  
  const slugStatus = useSlugValidation({
    value: slugValue,
    table,
    currentId,
  });

  // Auto-generate slug from source field
  const generateSlug = () => {
    if (sourceValue) {
      const slug = sourceValue
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens
        .trim()
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
      
      setValue(name, slug);
    }
  };

  const getStatusIcon = () => {
    switch (slugStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "taken":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (slugStatus) {
      case "checking":
        return "Verificando disponibilidade...";
      case "available":
        return "Slug disponível";
      case "taken":
        return "Slug já está em uso";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
        </Label>
      )}
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={!!fieldError}
                className="flex-1"
              />
            )}
          />
          
          {generateFrom && (
            <Button
              type="button"
              variant="outline"
              onClick={generateSlug}
              disabled={disabled || !sourceValue}
              size="sm"
            >
              Gerar
            </Button>
          )}
          
          <div className="flex items-center justify-center w-8">
            {getStatusIcon()}
          </div>
        </div>
        
        {slugStatus !== "idle" && (
          <p className={`text-sm ${
            slugStatus === "available" ? "text-green-600" :
            slugStatus === "taken" ? "text-red-600" :
            "text-muted-foreground"
          }`}>
            {getStatusMessage()}
          </p>
        )}
      </div>
      
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}