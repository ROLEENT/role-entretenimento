import { useFormContext } from "react-hook-form";
import { RHFInput } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { DAYS_LABELS } from "@/schemas/venue";

export function VenueOpeningHoursFields() {
  const daysList = Object.entries(DAYS_LABELS);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários de Funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {daysList.map(([key, label]) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-sm font-medium">
              {label}
            </label>
            <div className="md:col-span-3">
              <RHFInput
                name={`opening_hours.${key}`}
                placeholder="Ex: 18:00 - 02:00, Fechado"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}