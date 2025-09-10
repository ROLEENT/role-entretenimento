import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Star, Award, AlertTriangle, CheckCircle } from 'lucide-react';

const OrganizerPolicies = () => {
  const requirements = [
    {
      icon: CheckCircle,
      title: "Documentação",
      description: "[PLACEHOLDER] Documentos necessários para ser organizador verificado.",
      items: ["CNPJ ou CPF", "Comprovante de endereço", "Portfolio de eventos"]
    },
    {
      icon: Star,
      title: "Qualidade",
      description: "[PLACEHOLDER] Padrões de qualidade exigidos para eventos.",
      items: ["Proposta cultural clara", "Estrutura adequada", "Segurança garantida"]
    },
    {
      icon: Users,
      title: "Responsabilidade",
      description: "[PLACEHOLDER] Responsabilidades do organizador com o público.",
      items: ["Informações precisas", "Cumprimento de promessas", "Atendimento ao público"]
    }
  ];

  const benefits = [
    {
      title: "Verificação",
      description: "Selo de organizador verificado"
    },
    {
      title: "Destaque",
      description: "Prioridade na curadoria editorial"
    },
    {
      title: "Analytics",
      description: "Relatórios detalhados de performance"
    },
    {
      title: "Suporte",
      description: "Atendimento prioritário"
    }
  ];

  const violations = [
    {
      level: "Advertência",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      description: "[PLACEHOLDER] Infrações que resultam em advertência.",
      examples: ["Informações incorretas", "Atraso na comunicação", "Falhas menores"]
    },
    {
      level: "Suspensão",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      description: "[PLACEHOLDER] Infrações que resultam em suspensão temporária.",
      examples: ["Eventos cancelados sem aviso", "Problemas recorrentes", "Violação de políticas"]
    },
    {
      level: "Banimento",
      color: "bg-red-100 text-red-800 border-red-300",
      description: "[PLACEHOLDER] Infrações graves que resultam em banimento.",
      examples: ["Fraude", "Eventos perigosos", "Comportamento antiético"]
    }
  ];

  return (
    <InstitutionalPageWrapper
      title="Políticas do Organizador"
      description="Diretrizes e requisitos para organizadores de eventos na plataforma ROLÊ ENTRETENIMENTO."
      seoTitle="Políticas do Organizador | ROLÊ ENTRETENIMENTO"
      seoDescription="Conheça as políticas para organizadores de eventos no ROLÊ. Requisitos, benefícios e responsabilidades."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Para organizadores comprometidos</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                [PLACEHOLDER] Texto sobre a importância de organizadores de qualidade 
                para o ecossistema cultural e como o ROLÊ seleciona seus parceiros.
              </p>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="text-sm text-muted-foreground">
                <strong>Conteúdo será inserido na Fase 2:</strong><br/>
                • Manifesto para organizadores culturais<br/>
                • Valores e compromissos esperados<br/>
                • Visão de parceria estratégica
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Requisitos para organizadores</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {requirements.map((requirement, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <requirement.icon className="h-6 w-6 text-primary" />
                    {requirement.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {requirement.description}
                  </p>
                  <ul className="space-y-2">
                    {requirement.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Benefícios para organizadores verificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Standards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Padrões para eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Informações obrigatórias</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Data, horário e local precisos</li>
                  <li>• Descrição detalhada do evento</li>
                  <li>• Política de entrada e valores</li>
                  <li>• Informações de segurança</li>
                  <li>• Contato para dúvidas</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Qualidade exigida</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Fotos e vídeos de alta qualidade</li>
                  <li>• Lineup confirmado</li>
                  <li>• Estrutura adequada ao público</li>
                  <li>• Medidas de segurança</li>
                  <li>• Acessibilidade considerada</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violation Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              Níveis de infração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {violations.map((violation, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={violation.color}>
                      {violation.level}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">
                    {violation.description}
                  </p>
                  
                  <div>
                    <h4 className="font-medium mb-2">Exemplos:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {violation.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Process */}
        <Card>
          <CardHeader>
            <CardTitle>Processo de candidatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Como se candidatar</h3>
                  <p className="text-muted-foreground mb-4">
                    [PLACEHOLDER] Passo a passo para se tornar organizador verificado no ROLÊ.
                  </p>
                  <Button>
                    Iniciar candidatura
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Tempo de análise</h3>
                  <p className="text-muted-foreground mb-4">
                    [PLACEHOLDER] Prazo para análise de candidaturas e critérios de aprovação.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>• Análise inicial: até 7 dias</p>
                    <p>• Verificação de documentos: até 15 dias</p>
                    <p>• Resposta final: até 30 dias</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Pronto para ser parceiro?</h2>
              <p className="text-muted-foreground mb-6">
                [PLACEHOLDER] Call to action para organizadores interessados em parceria.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg">
                  Candidatar-se agora
                </Button>
                <Button variant="outline" size="lg">
                  Falar com nossa equipe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default OrganizerPolicies;