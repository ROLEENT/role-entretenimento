import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Users, Calendar, Shield } from 'lucide-react';

const FAQ = () => {
  const faqSections = [
    {
      title: "Geral",
      icon: HelpCircle,
      faqs: [
        {
          question: "O que é o ROLÊ?",
          answer: "[PLACEHOLDER] Conteúdo sobre o que é o ROLÊ, missão, visão e valores da plataforma."
        },
        {
          question: "Como funciona a curadoria de eventos?",
          answer: "[PLACEHOLDER] Explicação detalhada sobre o processo de curadoria editorial do ROLÊ."
        },
        {
          question: "Posso sugerir melhorias para a plataforma?",
          answer: "[PLACEHOLDER] Como usuários podem contribuir com feedback e sugestões."
        }
      ]
    },
    {
      title: "Para Rolezeiras",
      icon: Users,
      faqs: [
        {
          question: "Como criar minha conta?",
          answer: "[PLACEHOLDER] Passo a passo para criar conta de usuário rolezeira."
        },
        {
          question: "Como favoritar eventos?",
          answer: "[PLACEHOLDER] Instruções sobre sistema de favoritos e salvamento de eventos."
        },
        {
          question: "Como receber notificações?",
          answer: "[PLACEHOLDER] Configuração de notificações e alertas de eventos."
        }
      ]
    },
    {
      title: "Para Criadores",
      icon: Calendar,
      faqs: [
        {
          question: "Como submeter meu evento?",
          answer: "[PLACEHOLDER] Processo para artistas e organizadores submeterem eventos."
        },
        {
          question: "Quais critérios para aprovação?",
          answer: "[PLACEHOLDER] Critérios editoriais para aprovação de eventos."
        },
        {
          question: "Posso ter um perfil verificado?",
          answer: "[PLACEHOLDER] Como obter verificação e destaque no perfil."
        }
      ]
    },
    {
      title: "Políticas",
      icon: Shield,
      faqs: [
        {
          question: "Como denunciar conteúdo?",
          answer: "[PLACEHOLDER] Processo para denunciar conteúdo inadequado ou problemas."
        },
        {
          question: "Quais são as regras de uso?",
          answer: "[PLACEHOLDER] Resumo das principais regras e políticas da plataforma."
        },
        {
          question: "Como excluir minha conta?",
          answer: "[PLACEHOLDER] Processo para exclusão de conta e dados pessoais."
        }
      ]
    }
  ];

  return (
    <InstitutionalPageWrapper
      title="Perguntas Frequentes"
      description="Tire suas dúvidas sobre o ROLÊ, nossa curadoria e como aproveitar ao máximo a plataforma."
      seoTitle="FAQ - Perguntas Frequentes | ROLÊ ENTRETENIMENTO"
      seoDescription="Central de dúvidas do ROLÊ ENTRETENIMENTO. Encontre respostas sobre eventos, perfis, políticas e muito mais."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-8">
        {faqSections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <section.icon className="h-6 w-6 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`${sectionIndex}-${faqIndex}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}

        {/* Contact Support */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Não encontrou sua resposta?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              [PLACEHOLDER] Texto sobre entrar em contato para dúvidas específicas.
            </p>
            <div className="text-sm text-muted-foreground">
              <p><strong>Conteúdo será inserido na Fase 2</strong></p>
              <p>• Textos editoriais no tom ROLÊ</p>
              <p>• Respostas detalhadas para cada seção</p>
              <p>• Links para políticas específicas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default FAQ;