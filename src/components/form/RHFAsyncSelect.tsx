import AsyncSelect from "react-select/async";
import { Controller, useFormContext } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
  table: string;
  valueField?: string;   // padrão: "id"
  labelField?: string;   // padrão: "name"
  searchField?: string;  // padrão: labelField
  where?: Record<string, string | number | boolean | null | undefined>;
  isMulti?: boolean;
  disabled?: boolean;
};

export function RHFAsyncSelect({
  name,
  label,
  placeholder = "Selecione...",
  table,
  valueField = "id",
  labelField = "name",
  searchField,
  where,
  isMulti,
  disabled,
}: Props) {
  const { control } = useFormContext();
  const searchCol = searchField ?? labelField;

  const loadOptions = async (inputValue: string) => {
    let q = supabase.from(table)
      .select(`${valueField}, ${labelField}`)
      .order(labelField, { ascending: true })
      .limit(50);

    if (inputValue?.trim()) q = q.ilike(searchCol, `%${inputValue.trim()}%`);
    if (where) {
      Object.entries(where).forEach(([k, v]) => {
        if (v === undefined) return;
        q = v === null ? q.is(k, null) : q.eq(k, v as any);
      });
    }

    const { data, error } = await q;
    if (error) {
      console.error(`[AsyncSelect] ${table}:`, error.message);
      return [];
    }
    return (data ?? []).map(r => ({ value: r[valueField], label: r[labelField] }));
  };

  // estilos: menu abre acima de tudo e não é cortado, com background adequado
  const styles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({ 
      ...base, 
      position: "fixed" as const,
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius)",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused 
        ? "hsl(var(--accent))" 
        : state.isSelected 
          ? "hsl(var(--primary))" 
          : "transparent",
      color: state.isSelected 
        ? "hsl(var(--primary-foreground))" 
        : "hsl(var(--foreground))",
      "&:hover": {
        backgroundColor: "hsl(var(--accent))",
      }
    }),
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "hsl(var(--background))",
      borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--border))",
      minHeight: "40px",
      "&:hover": {
        borderColor: "hsl(var(--border))",
      }
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "hsl(var(--foreground))",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "hsl(var(--accent))",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "hsl(var(--accent-foreground))",
    }),
    loadingMessage: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
    noOptionsMessage: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
  };

  return (
    <div className="w-full">
      {label ? <label className="mb-2 block text-sm font-medium text-foreground">{label}</label> : null}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <AsyncSelect
            inputId={name}
            cacheOptions
            defaultOptions
            isClearable
            isMulti={isMulti}
            isDisabled={disabled}
            loadOptions={loadOptions}
            value={field.value}
            onChange={(val) => field.onChange(val)}
            placeholder={placeholder}
            menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
            menuPosition="fixed"
            styles={styles}
            classNamePrefix="rs"
            noOptionsMessage={() => "Nenhum resultado"}
            loadingMessage={() => "Carregando..."}
          />
        )}
      />
    </div>
  );
}