import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RHFInput, RHFURLInput, RHFSocialLinks, RHFDocumentInput } from '@/components/form';
import { OrganizerFlexibleForm } from '@/schemas/agents-flexible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrganizerContactTabProps {
  form: UseFormReturn<OrganizerFlexibleForm>;
}

export const OrganizerContactTab: React.FC<OrganizerContactTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contato Básico</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="email"
            type="email"
            label="Email"
            placeholder="contato@exemplo.com"
          />
          
          <RHFInput
            name="phone"
            label="Telefone"
            placeholder="(11) 99999-9999"
          />
          
          <RHFInput
            name="whatsapp"
            label="WhatsApp"
            placeholder="(11) 99999-9999"
          />
          
          <RHFInput
            name="instagram"
            label="Instagram"
            placeholder="@usuario"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações de Faturamento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="invoice_name"
            label="Nome para Faturamento"
            placeholder="Nome completo ou Razão Social"
          />
          
          <RHFDocumentInput
            name="tax_id"
            label="CPF/CNPJ"
            type="auto"
          />
          
          <RHFInput
            name="invoice_email"
            type="email"
            label="Email para Faturamento"
            placeholder="financeiro@exemplo.com"
          />
          
          <RHFInput
            name="pix_key"
            label="Chave PIX"
            placeholder="email@exemplo.com ou 11999999999"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Bancários</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="bank.bank"
            label="Banco"
            placeholder="Ex: Banco do Brasil"
          />
          
          <RHFInput
            name="bank.agency"
            label="Agência"
            placeholder="Ex: 1234-5"
          />
          
          <RHFInput
            name="bank.account"
            label="Conta"
            placeholder="Ex: 12345-6"
          />
        </CardContent>
      </Card>

      <RHFSocialLinks
        namePrefix="links"
        label="Links Sociais"
        showInstagram={false}
        showWebsite={true}
        showFacebook={true}
        showLinkedin={true}
        showYoutube={true}
        showTwitter={true}
      />
    </div>
  );
};