import React, { useState } from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MessageSquare, Clock, MapPin, Send } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: MessageSquare,
      title: "WhatsApp",
      description: "Resposta rápida em horário comercial",
      contact: "+55 51 98070-4353",
      action: "Conversar",
      href: "https://wa.me/5551980704353"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Para assuntos mais complexos",
      contact: "contato@roleentretenimento.com",
      action: "Enviar email",
      href: "mailto:contato@roleentretenimento.com"
    },
    {
      icon: Phone,
      title: "Telefone",
      description: "Atendimento comercial",
      contact: "+55 51 3333-4444",
      action: "Ligar",
      href: "tel:+555133334444"
    }
  ];

  const categories = [
    "Dúvidas gerais",
    "Submissão de evento",
    "Problemas técnicos",
    "Parcerias comerciais",
    "Imprensa",
    "Denúncia",
    "Outros"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // [PLACEHOLDER] Implementação do envio do formulário
    console.log('Form submitted:', formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <InstitutionalPageWrapper
      title="Fale Conosco"
      description="Entre em contato com a equipe do ROLÊ. Estamos aqui para ajudar com dúvidas, sugestões e parcerias."
      seoTitle="Fale Conosco | ROLÊ ENTRETENIMENTO"
      seoDescription="Entre em contato com o ROLÊ ENTRETENIMENTO. Atendimento por WhatsApp, email e telefone. Suporte completo para usuários e parceiros."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Quick Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <method.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {method.description}
                </p>
                <p className="font-medium mb-4">{method.contact}</p>
                <Button asChild className="w-full">
                  <a href={method.href} target="_blank" rel="noopener noreferrer">
                    {method.action}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-6 w-6 text-primary" />
              Envie sua mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="Resumo do seu contato"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Descreva sua dúvida, sugestão ou proposta..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Enviar mensagem
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Conteúdo será inserido na Fase 2:</strong><br/>
                • Integração com sistema de tickets<br/>
                • Confirmação automática de recebimento<br/>
                • Tracking de status da solicitação
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours & Location */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Horário de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Segunda a Sexta</span>
                  <span className="text-muted-foreground">9h às 18h</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sábado</span>
                  <span className="text-muted-foreground">9h às 14h</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Domingo</span>
                  <span className="text-muted-foreground">Fechado</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Resposta via WhatsApp:</strong> Até 2 horas em horário comercial<br/>
                  <strong>Resposta via email:</strong> Até 24 horas úteis
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">ROLÊ ENTRETENIMENTO</h4>
                  <p className="text-muted-foreground text-sm">
                    [PLACEHOLDER] Endereço da sede do ROLÊ<br/>
                    Porto Alegre - RS<br/>
                    Brasil
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">CNPJ</h4>
                  <p className="text-muted-foreground text-sm">
                    [PLACEHOLDER] XX.XXX.XXX/0001-XX
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Link */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Dúvidas frequentes?</h2>
              <p className="text-muted-foreground mb-6">
                Antes de entrar em contato, confira nossa seção de perguntas frequentes. 
                Talvez sua resposta já esteja lá!
              </p>
              <Button variant="outline" size="lg">
                Ver FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default ContactUs;