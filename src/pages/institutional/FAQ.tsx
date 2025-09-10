import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const faqs = [
    {
      question: "Como salvar um evento?",
      answer: "Na página do evento, clique em Salvar para depois. Ele vai direto pra sua conta, na aba Favoritos."
    },
    {
      question: "Como receber alertas de artistas e cidades?",
      answer: "Na página do artista, local ou organizador, clique em Ativar alertas. Você escolhe se quer receber por e-mail, push ou só no resumo semanal."
    },
    {
      question: "Como funciona a curadoria do ROLÊ?",
      answer: "A gente seleciona os eventos e perfis com base em relevância cultural, diversidade e conexão com a cena. Nem tudo entra, mas tudo que entra é escolhido a dedo."
    },
    {
      question: "Posso divulgar meu evento de graça?",
      answer: "Não. O ROLÊ é uma mídia independente que se sustenta com serviços de divulgação. Mas temos pacotes acessíveis como a Vitrine Cultural e condições especiais para produções menores."
    },
    {
      question: "O que é a Vitrine Cultural?",
      answer: "É a vitrine principal do ROLÊ, onde eventos ganham espaço no feed e no site com narrativa cultural. É paga, mas é o formato mais direto pra alcançar nosso público."
    },
    {
      question: "Como funciona a lista Trans/NB?",
      answer: "Em muitos eventos parceiros, pessoas trans e não-bináries têm entrada garantida ou lista especial. O ROLÊ sempre indica quando isso existe."
    },
    {
      question: "Quero excluir meus dados, como faço?",
      answer: "Na sua conta, vá em Privacidade e clique em Excluir conta. Você também pode solicitar exportar seus dados antes."
    }
  ];

  return (
    <InstitutionalPageWrapper
      title="Perguntas que já rolaram na pista"
      description="Antes de mandar DM, dá uma olhada aqui. Essa lista é viva e vai crescendo conforme as dúvidas aparecem."
      seoTitle="FAQ - Perguntas Frequentes | ROLÊ ENTRETENIMENTO"
      seoDescription="Central de dúvidas do ROLÊ ENTRETENIMENTO. Encontre respostas sobre eventos, perfis, políticas e muito mais."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
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

        {/* Contact Support */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Não achou sua dúvida aqui?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Vai na aba Fale Conosco e chama.
            </p>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default FAQ;