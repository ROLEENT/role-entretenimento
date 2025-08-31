import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: "cpf" | "cnpj" | "cpf-cnpj" | "cep" | "phone";
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, value, className, ...props }, ref) => {
    const applyMask = (inputValue: string, maskType: string): string => {
      // Remove tudo que não é dígito
      const digits = inputValue.replace(/\D/g, "");

      switch (maskType) {
        case "cpf":
          return digits
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})/, "$1-$2");

        case "cnpj":
          return digits
            .slice(0, 14)
            .replace(/(\d{2})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");

        case "cpf-cnpj":
          if (digits.length <= 11) {
            return digits
              .slice(0, 11)
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d{1,2})/, "$1-$2");
          } else {
            return digits
              .slice(0, 14)
              .replace(/(\d{2})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1/$2")
              .replace(/(\d{4})(\d)/, "$1-$2");
          }

        case "cep":
          return digits
            .slice(0, 8)
            .replace(/(\d{5})(\d)/, "$1-$2");

        case "phone":
          if (digits.length <= 10) {
            return digits
              .slice(0, 10)
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{4})(\d)/, "$1-$2");
          } else {
            return digits
              .slice(0, 11)
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{5})(\d)/, "$1-$2");
          }

        default:
          return digits;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const maskedValue = applyMask(inputValue, mask);
      
      // Criar novo evento com valor mascarado
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: maskedValue,
        },
      };
      
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={value || ""}
        onChange={handleChange}
        className={cn(className)}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";