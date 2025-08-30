import { useState } from "react";
import { Helmet } from "react-helmet";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Users, Heart, Zap, Target, Send } from "lucide-react";
import { toast } from "sonner";
import { ApplicationSchema } from "@/schemas/forms";
import { supabase } from "@/integrations/supabase/client";

const TrabalheConosco = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    portfolio_url: '',
    role: '',
    message: '',
    lgpd_consent: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      lgpd_consent: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate with Zod schema
    try {
      ApplicationSchema.parse(formData);
    } catch (error: any) {
      const firstError = error.errors?.[0]?.message || 'Por favor, preencha todos os campos obrigatórios';
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('forms-apply', {
        body: formData,
      });

      if (error) throw error;

      if (data?.ok) {
        toast.success("Candidatura enviada com sucesso! Entraremos em contato em breve.");
        setFormData({ 
          full_name: '', 
          email: '', 
          phone: '', 
          portfolio_url: '', 
          role: '', 
          message: '', 
          lgpd_consent: false 
        });
      } else {
        throw new Error(data?.error || 'Erro ao enviar candidatura');
      }
    } catch (error: any) {
      console.error('Erro ao enviar candidatura:', error);
      toast.error(error.message || 'Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <Helmet>
        <title>Trabalhe Conosco - Faça parte do time | ROLÊ ENTRETENIMENTO</title>
        <meta 
          name="description" 
          content="Venha trabalhar no ROLÊ ENTRETENIMENTO. Oportunidades nas áreas de Curadoria, Conteúdo, Produto e Comercial para profissionais apaixonados por cultura." 
        />
        <meta property="og:title" content="Trabalhe Conosco - Faça parte do time" />
        <meta property="og:description" content="Oportunidades de carreira no ROLÊ ENTRETENIMENTO para profissionais apaixonados por cultura." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/institucional/trabalhe-conosco" />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href="https://roleentretenimento.com/institucional/trabalhe-conosco" />
      </Helmet>

      <main className="pt-20 pb-16">
        {/* Breadcrumb */}
        <section className="container mx-auto px-4 py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/institucional">Institucional</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Trabalhe Conosco</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Trabalhe Conosco
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Procuramos profissionais apaixonados por cultura, inovação e experiências autênticas. 
                Venha fazer parte do time que conecta pessoas com os melhores momentos culturais do país.
              </p>
            </div>
          </div>
        </section>

        {/* Culture & Areas */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Company Culture */}
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-6">Nossa Cultura</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto mb-12 text-lg">
                  Somos uma equipe enxuta e dedicada que valoriza autonomia, criatividade e paixão pela cultura. 
                  Acreditamos no trabalho colaborativo e no impacto positivo que podemos gerar na cena cultural.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Paixão pela Cultura</h3>
                    <p className="text-muted-foreground">Vivemos e respiramos a cena cultural brasileira</p>
                  </div>
                  <div className="text-center">
                    <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Inovação Constante</h3>
                    <p className="text-muted-foreground">Sempre buscando novas formas de conectar pessoas</p>
                  </div>
                  <div className="text-center">
                    <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Foco em Resultados</h3>
                    <p className="text-muted-foreground">Orientados por métricas e impacto real</p>
                  </div>
                </div>
              </div>

              {/* Job Areas */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Áreas de Atuação</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        Curadoria Cultural
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Responsável pela seleção e curadoria de eventos, artistas e experiências culturais. 
                        Requer conhecimento profundo da cena cultural e networking sólido.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Pesquisa e descoberta de talentos</li>
                        <li>• Relacionamento com produtores e venues</li>
                        <li>• Análise de tendências culturais</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Zap className="h-6 w-6 text-primary" />
                        Conteúdo & Editorial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Criação de conteúdo editorial, redes sociais e materiais promocionais. 
                        Foco em storytelling autêntico e engajamento de audiência.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Redação e edição de conteúdo</li>
                        <li>• Gestão de redes sociais</li>
                        <li>• Produção audiovisual</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-primary" />
                        Produto & Tecnologia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Desenvolvimento e manutenção da plataforma digital, UX/UI design e análise de dados. 
                        Foco em experiência do usuário e performance técnica.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Desenvolvimento frontend/backend</li>
                        <li>• Design de interfaces</li>
                        <li>• Análise de dados e métricas</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Heart className="h-6 w-6 text-primary" />
                        Comercial & Parcerias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Desenvolvimento de parcerias estratégicas, vendas de produtos/serviços e relacionamento comercial. 
                        Foco em crescimento sustentável e networking.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Prospecção e vendas</li>
                        <li>• Gestão de parcerias</li>
                        <li>• Estratégia comercial</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Application Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Candidate-se</CardTitle>
                  <p className="text-center text-muted-foreground">
                    Envie sua candidatura e nos conte por que você seria uma adição incrível ao nosso time.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo *</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    
                      <div className="space-y-2">
                        <Label htmlFor="portfolio_url">Link do Portfólio / LinkedIn</Label>
                        <Input
                          id="portfolio_url"
                          name="portfolio_url"
                          type="url"
                          value={formData.portfolio_url}
                          onChange={handleInputChange}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Área de Interesse *</Label>
                      <Select onValueChange={handleSelectChange} value={formData.role}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma área" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="curadoria">Curadoria Cultural</SelectItem>
                          <SelectItem value="conteudo">Conteúdo & Editorial</SelectItem>
                          <SelectItem value="produto">Produto & Tecnologia</SelectItem>
                          <SelectItem value="comercial">Comercial & Parcerias</SelectItem>
                          <SelectItem value="geral">Interesse Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Conte-nos sobre você *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Por que você gostaria de trabalhar conosco? Qual é sua experiência relevante? O que você pode agregar ao nosso time?"
                        rows={6}
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="lgpd_consent"
                        checked={formData.lgpd_consent}
                        onCheckedChange={handleCheckboxChange}
                        required
                      />
                      <Label htmlFor="lgpd_consent" className="text-sm text-muted-foreground leading-relaxed">
                        Aceito que meus dados pessoais sejam coletados e processados de acordo com a{" "}
                        <a href="/politica-privacidade" className="text-primary hover:underline">
                          Política de Privacidade
                        </a>{" "}
                        do ROLÊ ENTRETENIMENTO para fins de recrutamento e seleção. *
                      </Label>
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                      {isSubmitting ? "Enviando..." : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Enviar Candidatura
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
};

export default TrabalheConosco;