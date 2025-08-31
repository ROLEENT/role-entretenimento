import { RHFRemoteCombobox } from "@/components/form/RHFRemoteCombobox";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

// Estados brasileiros para dropdown
const BRAZILIAN_STATES = [
  { id: 'AC', name: 'Acre' },
  { id: 'AL', name: 'Alagoas' },
  { id: 'AP', name: 'Amapá' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'BA', name: 'Bahia' },
  { id: 'CE', name: 'Ceará' },
  { id: 'DF', name: 'Distrito Federal' },
  { id: 'ES', name: 'Espírito Santo' },
  { id: 'GO', name: 'Goiás' },
  { id: 'MA', name: 'Maranhão' },
  { id: 'MT', name: 'Mato Grosso' },
  { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'PA', name: 'Pará' },
  { id: 'PB', name: 'Paraíba' },
  { id: 'PR', name: 'Paraná' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'PI', name: 'Piauí' },
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte' },
  { id: 'RS', name: 'Rio Grande do Sul' },
  { id: 'RO', name: 'Rondônia' },
  { id: 'RR', name: 'Roraima' },
  { id: 'SC', name: 'Santa Catarina' },
  { id: 'SP', name: 'São Paulo' },
  { id: 'SE', name: 'Sergipe' },
  { id: 'TO', name: 'Tocantins' }
];

export function ArtistLocationFields() {
  const { watch, setValue } = useFormContext();
  const country = watch("country");
  const state = watch("state");

  // Limpar campos dependentes quando país muda
  useEffect(() => {
    setValue("state", "", { shouldDirty: true });
    setValue("city", "", { shouldDirty: true });
  }, [country, setValue]);

  // Limpar cidade quando estado muda
  useEffect(() => {
    setValue("city", "", { shouldDirty: true });
  }, [state, setValue]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* País - por enquanto fixo no Brasil */}
      <div className="space-y-2">
        <label className="text-sm font-medium">País</label>
        <input
          type="text"
          value="Brasil"
          disabled
          className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
        />
        <input type="hidden" {...{ name: "country" }} value="BR" />
      </div>

      {/* Estado - dropdown estático dos estados brasileiros */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
        <select
          {...{ name: "state" }}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
          onChange={(e) => setValue("state", e.target.value, { shouldDirty: true })}
          value={state || ""}
        >
          <option value="">Selecione o estado</option>
          {BRAZILIAN_STATES.map((uf) => (
            <option key={uf.id} value={uf.id}>
              {uf.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cidade - busca remota filtrada por estado */}
      <RHFRemoteCombobox
        name="city_id"
        label="Cidade"
        table="cities"
        valueColumn="id"
        labelColumn="name"
        searchColumn="name"
        placeholder="Selecione a cidade"
        where={state ? { uf: state } : undefined}
        disabled={!state}
      />
    </div>
  );
}