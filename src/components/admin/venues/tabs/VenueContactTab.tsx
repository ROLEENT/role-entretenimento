import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFInput, InstagramField } from '@/components/form';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';
import { Phone, Mail, Globe, Instagram } from 'lucide-react';

interface VenueContactTabProps {
  form: UseFormReturn<VenueFlexibleFormData>;
}

export const VenueContactTab: React.FC<VenueContactTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              name="email"
              label="Email"
              type="email"
              placeholder="contato@local.com"
              description="Email principal do estabelecimento"
            />
            
            <RHFInput
              name="phone"
              label="Telefone"
              placeholder="(11) 99999-9999"
              description="Telefone principal para contato"
            />
          </div>

          <RHFInput
            name="whatsapp"
            label="WhatsApp"
            placeholder="(11) 99999-9999"
            description="Número do WhatsApp Business para contato direto"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Redes Sociais e Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFInput
            name="website"
            label="Website"
            placeholder="https://www.local.com"
            description="Site oficial do estabelecimento"
          />
          
          <InstagramField
            name="instagram"
            label="Instagram"
            placeholder="@local"
            agentType="venue"
          />
        </CardContent>
      </Card>
    </div>
  );
};