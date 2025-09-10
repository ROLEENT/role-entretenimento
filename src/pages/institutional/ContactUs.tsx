import React, { useState } from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MessageSquare, Clock, MapPin, Send, Users, Newspaper, HelpCircle, Wrench } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const contactBlocks = [
    {
      icon: Wrench,
      title: "Suporte",
      description: "Problemas técnicos, conta de usuário ou dificuldades no site.",
      email: "suporte@roleentretenimento.com",
      category: "suporte"
    },
    {
      icon: Users,
      title: "Parcerias e mídia",
      description: "Produtoras, marcas, coletivos e quem quiser colar com o ROLÊ nos projetos editoriais ou na Vitrine Cultural.",
      email: "parcerias@roleentretenimento.com",
      category: "parcerias"
    },
    {
      icon: Newspaper,
      title: "Imprensa",
      description: "Jornalistas e veículos que querem pautas, entrevistas ou materiais do ROLÊ.",
      email: "imprensa@roleentretenimento.com",
      category: "imprensa"
    },
    {
      icon: HelpCircle,
      title: "Dúvidas gerais",
      description: "Qualquer outro assunto que não se encaixe nas opções acima.",
      email: "contato@roleentretenimento.com",
      category: "geral"
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('');

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
      title="Quer trocar ideia? Chega mais."
      description="O ROLÊ é feito de conexão. Se você tem dúvida, sugestão, quer parceria ou só puxar papo, esse é o lugar certo. Escolhe o assunto e fala com a gente."
      seoTitle="Fale Conosco | ROLÊ ENTRETENIMENTO"
      seoDescription="Entre em contato com o ROLÊ. Suporte, parcerias, imprensa e dúvidas gerais. Escolhe o assunto e fala com a gente."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Contact Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          {contactBlocks.map((block, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedCategory === block.category ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedCategory(block.category)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <block.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{block.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {block.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant={selectedCategory === block.category ? "default" : "outline"} 
                        size="sm"
                        className="flex-1"
                      >
                        {selectedCategory === block.category ? "Selecionado" : "Usar formulário"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="flex-1"
                      >
                        <a href={`mailto:${block.email}`}>
                          Email direto
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form - Only shows when category is selected */}
        {selectedCategory && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-6 w-6 text-primary" />
                Formulário de {contactBlocks.find(b => b.category === selectedCategory)?.title}
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
            </CardContent>
          </Card>
        )}

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

        {/* Call to Action */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Prefere papo reto?</h2>
              <p className="text-muted-foreground mb-6">
                Manda no e-mail que a gente responde. Quer agilidade? Usa o formulário e já cai direto no nosso fluxo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" asChild>
                  <a href="mailto:contato@roleentretenimento.com">
                    Email direto
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="https://wa.me/5551980704353" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default ContactUs;