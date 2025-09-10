import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Eye, UserCheck, Scale, Globe } from 'lucide-react';

const GeneralUsePolicies = () => {
  const sections = [
    {
      icon: UserCheck,
      title: "Elegibilidade e Cadastro",
      description: "[PLACEHOLDER] Requisitos para usar a plataforma e processo de cadastro.",
      content: [
        "Idade mínima para uso",
        "Informações obrigatórias",
        "Verificação de identidade",
        "Responsabilidades do usuário"
      ]
    },
    {
      icon: Shield,
      title: "Uso Aceitável",
      description: "[PLACEHOLDER] O que é permitido e proibido na plataforma ROLÊ.",
      content: [
        "Conteúdo permitido",
        "Atividades proibidas",
        "Responsabilidade pelo conteúdo",
        "Direitos de propriedade intelectual"
      ]
    },
    {
      icon: Eye,
      title: "Privacidade e Dados",
      description: "[PLACEHOLDER] Como tratamos seus dados pessoais e privacidade.",
      content: [
        "Coleta de dados",
        "Uso das informações",
        "Compartilhamento de dados",
        "Direitos do usuário"
      ]
    },
    {
      icon: Scale,
      title: "Responsabilidades",
      description: "[PLACEHOLDER] Responsabilidades da plataforma e dos usuários.",
      content: [
        "Limitações de responsabilidade",
        "Disponibilidade do serviço",
        "Modificações na plataforma",
        "Resolução de disputas"
      ]
    },
    {
      icon: Globe,
      title: "Disposições Gerais",
      description: "[PLACEHOLDER] Termos gerais e condições especiais.",
      content: [
        "Lei aplicável",
        "Foro competente",
        "Alterações nos termos",
        "Contato e suporte"
      ]
    }
  ];

  const highlights = [
    {
      title: "Conteúdo Cultural",
      description: "[PLACEHOLDER] Diretrizes específicas para conteúdo cultural e eventos."
    },
    {
      title: "Propriedade Intelectual",
      description: "[PLACEHOLDER] Proteção de direitos autorais e propriedade intelectual."
    },
    {
      title: "Moderação",
      description: "[PLACEHOLDER] Como funciona a moderação de conteúdo na plataforma."
    }
  ];

  return (
    <InstitutionalPageWrapper
      title="Políticas de Uso Gerais"
      description="Termos e condições que regem o uso da plataforma ROLÊ ENTRETENIMENTO."
      seoTitle="Políticas de Uso | ROLÊ ENTRETENIMENTO"
      seoDescription="Conheça os termos de uso da plataforma ROLÊ. Políticas gerais, direitos, responsabilidades e condições de utilização."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Termos de Uso</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                [PLACEHOLDER] Introdução sobre a importância dos termos de uso e 
                como eles protegem tanto a plataforma quanto os usuários.
              </p>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Importante
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    [PLACEHOLDER] Aviso sobre a importância de ler e entender os termos antes de usar a plataforma.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <section.icon className="h-6 w-6 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {section.description}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Destaques importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {highlights.map((highlight, index) => (
                <div key={index} className="text-center p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LGPD Compliance */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Conformidade LGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              [PLACEHOLDER] Texto sobre conformidade com a Lei Geral de Proteção de Dados.
            </p>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300">
              Ver Política de Privacidade
            </Button>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Atualizações dos Termos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              [PLACEHOLDER] Informações sobre como e quando os termos podem ser atualizados.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Histórico de versões</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Versão 1.0 - 10 de setembro de 2025 (atual)</p>
                <p>• [PLACEHOLDER] Versões futuras serão listadas aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Dúvidas sobre os termos?</h2>
              <p className="text-muted-foreground mb-6">
                [PLACEHOLDER] Texto sobre como entrar em contato para esclarecimentos legais.
              </p>
              <div className="flex gap-4 justify-center">
                <Button>
                  Entrar em contato
                </Button>
                <Button variant="outline">
                  Ver outras políticas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Note */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Conteúdo será inserido na Fase 2:</strong>
              </p>
              <p>
                • Termos legais completos conforme legislação brasileira<br/>
                • Redação jurídica adequada e atualizada<br/>
                • Conformidade com LGPD, Marco Civil da Internet e CDC
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default GeneralUsePolicies;