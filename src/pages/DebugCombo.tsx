"use client";
import RHFCombobox from "@/components/rhf/RHFCombobox";
import { FormProvider, useForm } from "react-hook-form";

export default function DebugCombo() {
  const f = useForm({ defaultValues: { t: null } });
  
  return (
    <FormProvider {...f}>
      <div className="p-6 max-w-md">
        <RHFCombobox
          name="t"
          label="Teste"
          loadOptions={async (q) => {
            // Mock data for testing
            const mockOptions = [
              { label: "Um", value: "1" },
              { label: "Dois", value: "2" },
              { label: "Três", value: "3" }
            ];
            // Filter based on query
            return mockOptions.filter(opt => 
              opt.label.toLowerCase().includes(q.toLowerCase())
            );
          }}
          onCreate={async (label) => {
            console.log("Creating:", label);
            return { label, value: Date.now().toString() };
          }}
        />
      </div>
    </FormProvider>
  );
}