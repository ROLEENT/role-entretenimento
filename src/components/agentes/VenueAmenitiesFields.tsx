import { useFormContext } from "react-hook-form";
import { RHFCheckbox } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { AMENITIES_LABELS } from "@/schemas/venue";

export function VenueAmenitiesFields() {
  const amenitiesList = Object.entries(AMENITIES_LABELS);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Comodidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {amenitiesList.map(([key, label]) => (
            <RHFCheckbox
              key={key}
              name={`amenities.${key}`}
              label={label}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}