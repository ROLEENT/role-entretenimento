"use client";

import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import RHFSelect from "./RHFSelect";

const testOptions = [
  { value: "1", label: "São Paulo - SP" },
  { value: "2", label: "Rio de Janeiro - RJ" },
  { value: "3", label: "Belo Horizonte - MG" },
];

export default function RHFSelectTest() {
  const methods = useForm({
    defaultValues: {
      test_city: ""
    }
  });

  const onSubmit = (data: any) => {
    console.log("[RHFSelectTest] Form data:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded">
        <h3 className="font-medium">Teste RHFSelect Isolado</h3>
        
        <RHFSelect
          name="test_city"
          options={testOptions}
          placeholder="Selecione uma cidade de teste"
          parseValue={(v) => Number(v)}
          serializeValue={(v) => String(v ?? "")}
        />
        
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Testar Submit
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log("[RHFSelectTest] Current form values:", methods.getValues());
            }}
          >
            Log Values
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}