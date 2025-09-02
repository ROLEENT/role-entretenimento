import { useFormContext, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BaseFormFieldProps } from "@/lib/forms";

const COUNTRIES = [
  { value: 'BR', label: 'Brasil', flag: '🇧🇷' },
  { value: 'AR', label: 'Argentina', flag: '🇦🇷' },
  { value: 'UY', label: 'Uruguai', flag: '🇺🇾' },
  { value: 'PY', label: 'Paraguai', flag: '🇵🇾' },
  { value: 'CL', label: 'Chile', flag: '🇨🇱' },
  { value: 'BO', label: 'Bolívia', flag: '🇧🇴' },
  { value: 'PE', label: 'Peru', flag: '🇵🇪' },
  { value: 'EC', label: 'Equador', flag: '🇪🇨' },
  { value: 'CO', label: 'Colômbia', flag: '🇨🇴' },
  { value: 'VE', label: 'Venezuela', flag: '🇻🇪' },
  { value: 'GY', label: 'Guiana', flag: '🇬🇾' },
  { value: 'SR', label: 'Suriname', flag: '🇸🇷' },
  { value: 'GF', label: 'Guiana Francesa', flag: '🇬🇫' },
  { value: 'US', label: 'Estados Unidos', flag: '🇺🇸' },
  { value: 'CA', label: 'Canadá', flag: '🇨🇦' },
  { value: 'MX', label: 'México', flag: '🇲🇽' },
  { value: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { value: 'ES', label: 'Espanha', flag: '🇪🇸' },
  { value: 'FR', label: 'França', flag: '🇫🇷' },
  { value: 'IT', label: 'Itália', flag: '🇮🇹' },
  { value: 'DE', label: 'Alemanha', flag: '🇩🇪' },
  { value: 'GB', label: 'Reino Unido', flag: '🇬🇧' },
];

interface CountrySelectProps extends BaseFormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
}

export function CountrySelect({
  name,
  label = "País",
  placeholder = "Selecione o país",
  disabled,
  required,
}: CountrySelectProps) {
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
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className={fieldError ? "border-destructive" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {fieldError && (
        <p className="text-sm text-destructive" role="alert">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}