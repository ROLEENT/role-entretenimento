import { RHFRemoteCombobox } from "@/components/form/RHFRemoteCombobox";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

export function ArtistLocationFieldsRobust() {
  const { watch, setValue } = useFormContext();
  const countryId = watch("country_id");
  const stateId = watch("state_id");

  // Limpar campos dependentes quando país muda
  useEffect(() => {
    if (countryId) {
      setValue("state_id", "", { shouldDirty: true });
      setValue("city_id", "", { shouldDirty: true });
    }
  }, [countryId, setValue]);

  // Limpar cidade quando estado muda
  useEffect(() => {
    if (stateId) {
      setValue("city_id", "", { shouldDirty: true });
    }
  }, [stateId, setValue]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <RHFRemoteCombobox
        name="country_id"
        label="País"
        table="countries"
        valueColumn="id"
        labelColumn="name"
        searchColumn="name"
        placeholder="Selecione o país"
        required
      />

      <RHFRemoteCombobox
        name="state_id"
        label="Estado"
        table="states"
        valueColumn="id"
        labelColumn="name"
        searchColumn="name"
        placeholder="Selecione o estado"
        where={countryId ? { country_id: countryId } : undefined}
        disabled={!countryId}
        required
      />

      <RHFRemoteCombobox
        name="city_id"
        label="Cidade"
        table="cities"
        valueColumn="id"
        labelColumn="name"
        searchColumn="name"
        placeholder="Selecione a cidade"
        where={
          stateId 
            ? { state_id: stateId }
            : countryId 
            ? { country_id: countryId }
            : undefined
        }
        disabled={!stateId}
        required
      />
    </div>
  );
}