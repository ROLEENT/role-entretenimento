import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Download, 
  Calendar as CalendarIcon, 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity,
  Plus,
  Eye,
  Trash2
} from "lucide-react";
import { useBusinessIntelligence } from '@/hooks/useBusinessIntelligence';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminReports() {
  const {
    reports,
    metrics,
    loading,
    dateRange,
    setDateRange,
    generateReport,
    exportReport,
    deleteReport,
    getReportTypeLabel,
    getReportTypeIcon
  } = useBusinessIntelligence();

  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(null);

  const handleGenerateReport = async (type: any) => {
    await generateReport(type);
  };

  const handleExportReport = async (report: any, format: 'csv' | 'pdf' | 'excel') => {
    await exportReport(report, format);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Business Intelligence e relatórios detalhados
        </p>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <CardDescription>
            Selecione o período para geração dos relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover open={showDatePicker === 'from'} onOpenChange={(open) => setShowDatePicker(open ? 'from' : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange(prev => ({ ...prev, from: date }));
                        setShowDatePicker(null);
                      }
                    }}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover open={showDatePicker === 'to'} onOpenChange={(open) => setShowDatePicker(open ? 'to' : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange(prev => ({ ...prev, to: date }));
                        setShowDatePicker(null);
                      }
                    }}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics?.user_growth_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.event_completion_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de conclusão
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Gerar Relatórios</TabsTrigger>
          <TabsTrigger value="saved">Relatórios Salvos ({reports.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Relatório de Eventos
                </CardTitle>
                <CardDescription>
                  Performance e estatísticas de eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('events')}
                  disabled={loading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Relatório de Usuários
                </CardTitle>
                <CardDescription>
                  Análise de crescimento e engajamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('users')}
                  disabled={loading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Relatório de Crescimento
                </CardTitle>
                <CardDescription>
                  Métricas de crescimento e KPIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('growth')}
                  disabled={loading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Relatório de Engajamento
                </CardTitle>
                <CardDescription>
                  Análise de interação e retenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('engagement')}
                  disabled={loading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Relatório de Receita
                </CardTitle>
                <CardDescription>
                  Análise financeira e monetização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('revenue')}
                  disabled={loading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  Nenhum relatório salvo ainda
                </div>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getReportTypeIcon(report.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{report.name}</h4>
                          <Badge variant="outline">
                            {getReportTypeLabel(report.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Gerado em: {new Date(report.generated_at).toLocaleDateString('pt-BR')} • 
                          Período: {report.period}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Select onValueChange={(format) => handleExportReport(report, format as any)}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Exportar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteReport(report.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Categorias</CardTitle>
                <CardDescription>
                  Categorias de eventos mais populares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.top_categories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span>{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Cidades</CardTitle>
                <CardDescription>
                  Cidades com mais eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.top_cities.map((city, index) => (
                    <div key={city.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span>{city.name}</span>
                      </div>
                      <Badge variant="secondary">{city.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}