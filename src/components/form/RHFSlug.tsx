"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSlugValidation } from "@/hooks/useSlugValidation";
import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface RHFSlugProps {
  name: string;
  label?: string;
  table: "agenda_itens" | "artists" | "venues" | "organizers" | "blog_posts";
  currentId?: string;
  generateFrom?: string; // nome do campo para auto-gerar slug
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function RHFSlug({
  name,
  label,
  table,
  currentId,
  generateFrom,
  disabled,
  className,
  placeholder = "slug-do-item",
}: RHFSlugProps) {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const [debouncedSlug, setDebouncedSlug] = useState("");
  const { available, loading, error, checkSlug, generateSlug } = useSlugValidation(table);
  
  const fieldError = errors[name];
  const currentSlug = watch(name) || "";
  const generateFromValue = generateFrom ? watch(generateFrom) : "";

  // Debounce slug validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSlug(currentSlug);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentSlug]);

  // Validate slug when debounced value changes
  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      checkSlug(debouncedSlug, currentId);
    }
  }, [debouncedSlug, currentId, checkSlug]);

  // Auto-generate slug from other field
  const handleGenerateSlug = () => {
    if (generateFromValue) {
      const newSlug = generateSlug(generateFromValue);
      setValue(name, newSlug, { shouldDirty: true });
    }
  };

  // Get validation status
  const getValidationStatus = () => {
    if (!currentSlug || currentSlug.length < 3) return null;
    if (loading) return "loading";
    if (error) return "error";
    if (available) return "available";
    return "unavailable";
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
        </Label>
      )}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
                aria-invalid={!!fieldError}
              />
            )}
          />
          {validationStatus && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationStatus === "loading" && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {validationStatus === "available" && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              {validationStatus === "unavailable" && (
                <X className="h-4 w-4 text-destructive" />
              )}
              {validationStatus === "error" && (
                <X className="h-4 w-4 text-destructive" />
              )}
            </div>
          )}
        </div>
        {generateFrom && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateSlug}
            disabled={!generateFromValue || disabled}
          >
            Gerar
          </Button>
        )}
      </div>
      
      {/* Validation messages */}
      {validationStatus === "unavailable" && (
        <p className="text-sm text-destructive">
          Este slug já está em uso
        </p>
      )}
      {validationStatus === "error" && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
      {validationStatus === "available" && (
        <p className="text-sm text-green-600">
          Slug disponível
        </p>
      )}
      
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}