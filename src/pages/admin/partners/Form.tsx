import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";

export default function PartnerForm() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/admin/partners">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Parceiro</h1>
          <p className="text-muted-foreground">
            Adicione um novo parceiro à plataforma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados principais do parceiro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input placeholder="Nome do estabelecimento" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea placeholder="Descrição do parceiro..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar & Restaurante</SelectItem>
                    <SelectItem value="teatro">Teatro</SelectItem>
                    <SelectItem value="galeria">Galeria de Arte</SelectItem>
                    <SelectItem value="casa-show">Casa de Shows</SelectItem>
                    <SelectItem value="museu">Museu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Tipo de Parceria</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="colaborativo">Colaborativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localização e Contato</CardTitle>
            <CardDescription>
              Informações de localização e contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Endereço</label>
              <Input placeholder="Endereço completo" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cidade</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porto-alegre">Porto Alegre</SelectItem>
                    <SelectItem value="florianopolis">Florianópolis</SelectItem>
                    <SelectItem value="curitiba">Curitiba</SelectItem>
                    <SelectItem value="sao-paulo">São Paulo</SelectItem>
                    <SelectItem value="rio-janeiro">Rio de Janeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Estado</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Telefone</label>
              <Input placeholder="(11) 99999-9999" />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="contato@parceiro.com" />
            </div>

            <div>
              <label className="text-sm font-medium">Website</label>
              <Input placeholder="https://www.parceiro.com" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Configurações de exibição e status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Parceiro Ativo</label>
              <p className="text-sm text-muted-foreground">
                O parceiro será exibido publicamente no site
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Destaque na Home</label>
              <p className="text-sm text-muted-foreground">
                Exibir parceiro na seção destacada da página inicial
              </p>
            </div>
            <Switch />
          </div>

          <div>
            <label className="text-sm font-medium">Ordem de Exibição</label>
            <Input type="number" placeholder="1" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Salvar Parceiro
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/partners">
            Cancelar
          </Link>
        </Button>
      </div>
    </div>
  );
}