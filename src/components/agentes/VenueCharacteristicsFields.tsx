import { useFormContext } from "react-hook-form";
import { RHFCheckbox, RHFInput, RHFTextarea } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Building, 
  Star, 
  Coffee, 
  ChefHat, 
  Shield, 
  Accessibility, 
  Users 
} from "lucide-react";
import {
  ESTRUTURAS_LABELS,
  DIFERENCIAIS_LABELS,
  BEBIDAS_LABELS,
  COZINHA_LABELS,
  SEGURANCA_LABELS,
  ACESSIBILIDADE_LABELS,
} from "@/schemas/venue";

export function VenueCharacteristicsFields() {
  const estruturasList = Object.entries(ESTRUTURAS_LABELS);
  const diferenciaisList = Object.entries(DIFERENCIAIS_LABELS);
  const bebidasList = Object.entries(BEBIDAS_LABELS);
  const cozinhaList = Object.entries(COZINHA_LABELS);
  const segurancaList = Object.entries(SEGURANCA_LABELS);
  const acessibilidadeList = Object.entries(ACESSIBILIDADE_LABELS);

  return (
    <div className="space-y-6">
      {/* Características do Estabelecimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Características do Estabelecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RHFTextarea
            name="caracteristicas_estabelecimento.descricao"
            label="Descrição Geral"
            placeholder="Descreva as características gerais do estabelecimento..."
          />
        </CardContent>
      </Card>

      {/* Estruturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Estruturas e Facilidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="estruturas.descricao"
            label="Descrição das Estruturas"
            placeholder="Detalhes adicionais sobre as estruturas..."
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estruturasList.map(([key, label]) => (
              <RHFCheckbox
                key={key}
                name={`estruturas.${key}`}
                label={label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diferenciais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Diferenciais e Entretenimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="diferenciais.descricao"
            label="Descrição dos Diferenciais"
            placeholder="Detalhes sobre entretenimento e diferenciais..."
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diferenciaisList.map(([key, label]) => (
              <RHFCheckbox
                key={key}
                name={`diferenciais.${key}`}
                label={label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bebidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Bebidas e Bar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="bebidas.descricao"
            label="Descrição das Bebidas"
            placeholder="Detalhes sobre o menu de bebidas..."
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bebidasList.map(([key, label]) => (
              <RHFCheckbox
                key={key}
                name={`bebidas.${key}`}
                label={label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cozinha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Cozinha e Alimentação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="cozinha.descricao"
            label="Descrição da Cozinha"
            placeholder="Detalhes sobre o menu e opções alimentares..."
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cozinhaList.map(([key, label]) => (
              <RHFCheckbox
                key={key}
                name={`cozinha.${key}`}
                label={label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="seguranca.descricao"
            label="Descrição da Segurança"
            placeholder="Detalhes sobre medidas de segurança..."
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segurancaList.map(([key, label]) => (
              <RHFCheckbox
                key={key}
                name={`seguranca.${key}`}
                label={label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acessibilidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Acessibilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="acessibilidade.descricao"
            label="Descrição da Acessibilidade"
            placeholder="Detalhes sobre recursos de acessibilidade..."
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acessibilidadeList.map(([key, label]) => (
              <RHFCheckbox
                key={key}
                name={`acessibilidade.${key}`}
                label={label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Banheiros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Banheiros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFTextarea
            name="banheiros.descricao"
            label="Descrição dos Banheiros"
            placeholder="Detalhes sobre os banheiros..."
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RHFInput
              name="banheiros.masculinos"
              label="Masculinos"
              type="number"
            />
            <RHFInput
              name="banheiros.femininos"
              label="Femininos"
              type="number"
            />
            <RHFInput
              name="banheiros.genero_neutro"
              label="Gênero Neutro"
              type="number"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}