import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdvertisementForm() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/admin/advertisements">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Anúncio</h1>
          <p className="text-muted-foreground">
            Crie um novo anúncio para a plataforma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Anúncio</CardTitle>
            <CardDescription>
              Dados básicos do anúncio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input placeholder="Nome do anúncio" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Anunciante *</label>
              <Input placeholder="Nome do anunciante" />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea placeholder="Descrição do anúncio..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="texto">Texto</SelectItem>
                    <SelectItem value="nativo">Nativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Posição</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Topo da página</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="entre-conteudo">Entre conteúdo</SelectItem>
                    <SelectItem value="popup">Pop-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Exibição</CardTitle>
            <CardDescription>
              Quando e onde o anúncio deve aparecer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Data de Início</label>
                <Input type="date" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Data de Fim</label>
                <Input type="date" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Páginas de Exibição</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as páginas</SelectItem>
                  <SelectItem value="home">Apenas home</SelectItem>
                  <SelectItem value="eventos">Páginas de eventos</SelectItem>
                  <SelectItem value="blog">Páginas de blog</SelectItem>
                  <SelectItem value="cidades">Páginas de cidades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Frequência</label>
                <Input type="number" placeholder="1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">URL de Destino</label>
              <Input placeholder="https://www.exemplo.com" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mídia do Anúncio</CardTitle>
          <CardDescription>
            Upload de imagens, vídeos ou código HTML
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <Button variant="outline">
                  Fazer Upload
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Suporte para JPG, PNG, GIF, MP4 (máx. 10MB)
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Código HTML (opcional)</label>
            <Textarea 
              placeholder="Cole aqui o código HTML do anúncio..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status e Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Anúncio Ativo</label>
              <p className="text-sm text-muted-foreground">
                O anúncio será exibido nas páginas selecionadas
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Rastrear Cliques</label>
              <p className="text-sm text-muted-foreground">
                Acompanhar estatísticas de cliques e visualizações
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Salvar Anúncio
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/advertisements">
            Cancelar
          </Link>
        </Button>
      </div>
    </div>
  );
}