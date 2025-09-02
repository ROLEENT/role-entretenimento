import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface RHFCheckboxProps {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
}

export function RHFCheckbox({ name, label, description, disabled, required }: RHFCheckboxProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}