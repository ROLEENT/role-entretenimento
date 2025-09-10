import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Heart, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const RolezeiraPolicies = () => {
  const policies = [
    {
      icon: Heart,
      title: "Respeito e Inclusão",
      description: "[PLACEHOLDER] Políticas sobre comportamento respeitoso e ambiente inclusivo para todas as rolezeiras.",
      rules: [
        "Linguagem respeitosa",
        "Não tolerância a discriminação",
        "Respeito à diversidade"
      ]
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "[PLACEHOLDER] Diretrizes para interação positiva na comunidade ROLÊ.",
      rules: [
        "Colaboração construtiva",
        "Compartilhamento responsável",
        "Apoio mútuo"
      ]
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "[PLACEHOLDER] Medidas de segurança e proteção para usuárias da plataforma.",
      rules: [
        "Proteção de dados pessoais",
        "Denúncia de comportamentos inadequados",
        "Moderação ativa"
      ]
    }
  ];

  const violations = [
    {
      level: "Leve",
      icon: AlertTriangle,
      color: "text-yellow-600",
      description: "[PLACEHOLDER] Infrações leves e suas consequências.",
      examples: ["Linguagem inadequada", "Spam moderado", "Conteúdo off-topic"],
      action: "Aviso formal"
    },
    {
      level: "Moderada",
      icon: AlertTriangle,
      color: "text-orange-600", 
      description: "[PLACEHOLDER] Infrações moderadas e medidas aplicadas.",
      examples: ["Harassment", "Conteúdo ofensivo", "Violação de direitos autorais"],
      action: "Suspensão temporária"
    },
    {
      level: "Grave",
      icon: AlertTriangle,
      color: "text-red-600",
      description: "[PLACEHOLDER] Infrações graves que resultam em banimento.",
      examples: ["Discurso de ódio", "Ameaças", "Atividade ilegal"],
      action: "Banimento permanente"
    }
  ];

  return (
    <InstitutionalPageWrapper
      title="Políticas do Rolezeira"
      description="Diretrizes de comportamento e convivência para uma comunidade cultural respeitosa e inclusiva."
      seoTitle="Políticas do Rolezeira | ROLÊ ENTRETENIMENTO"
      seoDescription="Conheça as políticas de comportamento da comunidade ROLÊ. Diretrizes para uma experiência cultural respeitosa e inclusiva."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Nossa comunidade, nossas regras</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                [PLACEHOLDER] Texto sobre a importância de uma comunidade respeitosa e inclusiva
                para o desenvolvimento da cena cultural brasileira.
              </p>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="text-sm text-muted-foreground">
                <strong>Conteúdo será inserido na Fase 2:</strong><br/>
                • Manifesto da comunidade ROLÊ<br/>
                • Valores fundamentais da plataforma<br/>
                • Compromisso com diversidade e inclusão
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Core Policies */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Políticas fundamentais</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {policies.map((policy, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <policy.icon className="h-6 w-6 text-primary" />
                    {policy.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {policy.description}
                  </p>
                  <ul className="space-y-2">
                    {policy.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Violation Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Níveis de infração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {violations.map((violation, index) => (
                <div key={index} className="border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <violation.icon className={`h-6 w-6 ${violation.color}`} />
                    <h3 className="text-xl font-semibold">{violation.level}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {violation.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Exemplos:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {violation.examples.map((example, exampleIndex) => (
                          <li key={exampleIndex}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Ação:</h4>
                      <p className="text-sm font-medium text-foreground">
                        {violation.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reporting */}
        <Card>
          <CardHeader>
            <CardTitle>Como denunciar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Canais de denúncia</h3>
                <p className="text-muted-foreground mb-4">
                  [PLACEHOLDER] Instruções sobre como e onde denunciar comportamentos inadequados.
                </p>
                <Button variant="outline">
                  Fazer denúncia
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Tempo de resposta</h3>
                <p className="text-muted-foreground mb-4">
                  [PLACEHOLDER] Informações sobre prazo de análise e resposta às denúncias.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• Infrações graves: até 24h</p>
                  <p>• Infrações moderadas: até 72h</p>
                  <p>• Infrações leves: até 7 dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Dúvidas sobre as políticas?</h2>
              <p className="text-muted-foreground mb-6">
                [PLACEHOLDER] Texto sobre entrar em contato para esclarecimentos.
              </p>
              <Button>
                Entrar em contato
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default RolezeiraPolicies;