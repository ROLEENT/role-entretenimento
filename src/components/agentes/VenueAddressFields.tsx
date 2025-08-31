import { useFormContext } from "react-hook-form";
import { RHFInput, RHFMaskedInput } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function VenueAddressFields() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <RHFInput
              name="address_line"
              label="Endereço"
              placeholder="Rua, número"
            />
          </div>
          
          <RHFInput
            name="district"
            label="Bairro"
            placeholder="Nome do bairro"
          />
          
          <RHFInput
            name="city"
            label="Cidade"
            placeholder="Nome da cidade"
          />
          
          <RHFInput
            name="state"
            label="Estado"
            placeholder="SP, RJ, MG..."
          />
          
          <RHFMaskedInput
            name="postal_code"
            label="CEP"
            placeholder="00000-000"
            mask="cep"
          />
          
          <RHFInput
            name="country"
            label="País"
            placeholder="BR"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="latitude"
            label="Latitude"
            type="number"
            placeholder="-23.5505"
          />
          
          <RHFInput
            name="longitude"
            label="Longitude"
            type="number"
            placeholder="-46.6333"
          />
        </div>
      </CardContent>
    </Card>
  );
}