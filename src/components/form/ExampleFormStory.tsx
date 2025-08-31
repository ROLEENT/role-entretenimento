"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormProvider } from 'react-hook-form';
import { 
  RHFInput,
  RHFTextarea,
  RHFSelect,
  RHFComboboxChips,
  RHFDateTimeUtc,
  RHFImageUploader,
  RHFSwitch
} from '@/components/form';

// Example schema
const exampleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  tags: z.array(z.string()).max(12, "Máximo 12 tags"),
  startDate: z.date(),
  endDate: z.date(),
  image: z.object({
    url: z.string(),
    alt: z.string().min(1, "Texto alternativo é obrigatório")
  }).optional(),
  isActive: z.boolean(),
});

type ExampleFormData = z.infer<typeof exampleSchema>;

export default function ExampleFormStory() {
  const methods = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      tags: [],
      isActive: true,
    }
  });

  const onSubmit = (data: ExampleFormData) => {
    console.log("Form data:", data);
    alert("Verifique o console para ver os dados");
  };

  const categoryOptions = [
    "Música",
    "Arte",
    "Teatro",
    "Cinema",
    "Dança"
  ];

  const mockUpload = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return URL.createObjectURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo de Formulários RHF</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="name"
                  label="Nome"
                  placeholder="Digite o nome"
                  required
                />
                
                <RHFSelect
                  name="category"
                  label="Categoria"
                  options={categoryOptions}
                  required
                />
              </div>

              <RHFTextarea
                name="description"
                label="Descrição"
                placeholder="Descreva o evento..."
                rows={4}
              />

              {/* Chips for tags */}
              <RHFComboboxChips
                name="tags"
                label="Tags"
                placeholder="Digite uma tag e pressione Enter"
                description="Máximo 12 tags. Use Enter ou vírgula para adicionar."
                maxItems={12}
                showCounter
              />

              {/* DateTime fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFDateTimeUtc
                  name="startDate"
                  label="Data de Início"
                  required
                />
                
                <RHFDateTimeUtc
                  name="endDate"
                  label="Data de Fim"
                  compareWithField="startDate"
                  isEndDate
                  required
                />
              </div>

              {/* Image upload */}
              <RHFImageUploader
                name="image"
                label="Imagem do Evento"
                description="Upload de uma imagem (máximo 5MB)"
                onUpload={mockUpload}
                requireAlt
              />

              {/* Switch */}
              <RHFSwitch
                name="isActive"
                label="Evento ativo"
                description="Marque para tornar o evento visível publicamente"
              />

              <div className="flex gap-4">
                <Button type="submit">
                  Salvar
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => methods.reset()}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      {/* Form state debug */}
      <Card>
        <CardHeader>
          <CardTitle>Estado do Formulário (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(methods.watch(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}