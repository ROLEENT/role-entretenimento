"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Opt = { value: string; label: string };

type Props = {
  name: string;
  options: Opt[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** transforma string do UI -> tipo do form (ex: number/uuid) */
  parseValue?: (v: string) => any;
  /** transforma valor do form -> string do UI */
  serializeValue?: (v: any) => string;
};

export default function RHFSelect({
  name,
  options,
  placeholder = "Selecione...",
  className,
  disabled,
  parseValue = (v) => v,           // por padrão, mantém string
  serializeValue = (v) => (v ?? "")?.toString(),
}: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const uiValue = field.value == null ? "" : serializeValue(field.value);

        return (
          <div className={cn("space-y-1", className)}>
            <Select
              value={uiValue}
              onValueChange={(v) => field.onChange(parseValue(v))}
              disabled={disabled}
            >
              <SelectTrigger className={cn(fieldState.error && "border-destructive")}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              {/* evita problemas de portal/z-index dentro de dialogs/accordions */}
              <SelectContent position="popper" className="z-50">
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && (
              <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}