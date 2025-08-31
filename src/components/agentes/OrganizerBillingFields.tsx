import { useFormContext } from "react-hook-form";
import { RHFInput, RHFSelect } from "@/components/form";
import { RHFMaskedInput } from "@/components/form/RHFMaskedInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Building2, DollarSign } from "lucide-react";

interface OrganizerBillingFieldsProps {
  className?: string;
}

export function OrganizerBillingFields({ className }: OrganizerBillingFieldsProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informações de Faturamento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Opcional. Necessário apenas para emissão de notas fiscais.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados de Faturamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RHFInput
              name="invoice_name"
              label="Nome para Faturamento"
              placeholder="Razão social ou nome completo"
            />
            
            <RHFMaskedInput
              name="tax_id"
              label="CNPJ/CPF"
              mask="cpf-cnpj"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RHFInput
              name="invoice_email"
              label="E-mail para Faturamento"
              type="email"
              placeholder="faturamento@empresa.com"
            />
            
            <RHFInput
              name="pix_key"
              label="Chave PIX"
              placeholder="E-mail, telefone, CPF/CNPJ ou chave aleatória"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados Bancários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados Bancários
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Opcional. Para transferências bancárias.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RHFInput
              name="bank.bank"
              label="Banco"
              placeholder="Nome do banco"
            />
            
            <RHFInput
              name="bank.agency"
              label="Agência"
              placeholder="0000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RHFInput
              name="bank.account"
              label="Conta"
              placeholder="00000-0"
            />
            
            <RHFSelect
              name="bank.type"
              label="Tipo de Conta"
              options={[
                { value: "corrente", label: "Conta Corrente" },
                { value: "poupanca", label: "Poupança" },
              ]}
              placeholder="Selecione o tipo"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}