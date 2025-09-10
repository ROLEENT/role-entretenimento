import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  UserCheck, 
  Calendar, 
  Users, 
  Shield, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

const Help = () => {
  const navigationBlocks = [
    {
      title: "FAQ",
      description: "As perguntas que todo mundo faz já estão respondidas aqui.",
      icon: HelpCircle,
      link: "/faq",
      color: "from-blue-500/10 to-blue-600/10 border-blue-500/20"
    },
    {
      title: "Como ter seu perfil publicado",
      description: "Artistas, coletivos e locais, aqui é o caminho.",
      icon: UserCheck,
      link: "/como-ter-perfil-publicado",
      color: "from-green-500/10 to-green-600/10 border-green-500/20"
    },
    {
      title: "Como divulgar seu evento",
      description: "Produtorxs, entendam como funciona a Vitrine Cultural e pacotes editoriais.",
      icon: Calendar,
      link: "/como-divulgar-evento",
      color: "from-purple-500/10 to-purple-600/10 border-purple-500/20"
    },
    {
      title: "Políticas do Rolezeira",
      description: "Seus direitos e deveres como usuário.",
      icon: Users,
      link: "/politicas-rolezeira",
      color: "from-orange-500/10 to-orange-600/10 border-orange-500/20"
    },
    {
      title: "Políticas de uso",
      description: "Regras gerais da plataforma.",
      icon: Shield,
      link: "/politicas-uso",
      color: "from-red-500/10 to-red-600/10 border-red-500/20"
    },
    {
      title: "Fale conosco",
      description: "Quer trocar ideia direto com a gente? Esse é o canal.",
      icon: MessageSquare,
      link: "/fale-conosco",
      color: "from-primary/10 to-secondary/10 border-primary/20"
    }
  ];

  return (
    <InstitutionalPageWrapper
      title="Tá perdido? Relaxa, a gente te ajuda."
      description="O ROLÊ é feito pra conectar você com o que a cidade tem de mais quente na música, arte e cultura. Aqui você encontra eventos, artistas, locais e organizadores, tudo amarrado num só lugar. E se bater dúvida, esse espaço existe pra simplificar sua vida."
      seoTitle="Ajuda e Suporte | ROLÊ ENTRETENIMENTO"
      seoDescription="Central de ajuda do ROLÊ ENTRETENIMENTO. Encontre tudo sobre eventos, perfis, políticas e muito mais."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-8">
        {/* Navigation Blocks */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {navigationBlocks.map((block, index) => (
            <Card key={index} className={`bg-gradient-to-br ${block.color} hover:shadow-lg transition-all duration-300 group`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <block.icon className="h-6 w-6 text-primary" />
                  {block.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {block.description}
                </p>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to={block.link} className="flex items-center justify-center gap-2">
                    Acessar
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 text-center">
          <CardContent className="py-8">
            <h3 className="text-xl font-semibold mb-4">
              Não encontrou o que queria?
            </h3>
            <p className="text-muted-foreground mb-6">
              Clica em Fale Conosco e bora resolver.
            </p>
            <Button asChild size="lg">
              <Link to="/fale-conosco">
                Fale Conosco
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default Help;