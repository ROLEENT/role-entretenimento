import React from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { PublicLayout } from '@/components/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Calendar, MessageSquare, Star, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateProfileComingSoon: React.FC = () => {
  return (
    <PageWrapper
      title="Criação de Perfil - Em Breve | ROLÊ"
      description="Descubra como criar seu perfil na plataforma ROLÊ. Em breve você poderá criar e gerenciar seu próprio perfil. Entre em contato conosco para mais informações."
      type="website"
    >
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Criação de Perfil</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Seu Perfil, Sua História
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                No momento, apenas nossa equipe ROLÊ pode criar perfis na plataforma. 
                Mas isso vai mudar em breve!
              </p>
            </div>

            <div className="grid gap-8 md:gap-12">
              {/* Current Status Card */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Como Funciona Hoje</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-6">
                    Atualmente, nossa equipe cuida da criação de perfis para garantir 
                    qualidade e autenticidade em nossa plataforma.
                  </p>
                  
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Criação Manual pela Equipe ROLÊ</span>
                  </div>
                </CardContent>
              </Card>

              {/* Coming Soon Section */}
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Em Breve: Criação Automática</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    <Zap className="w-3 h-3 mr-1" />
                    Próximas Atualizações
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground mb-8">
                    Estamos desenvolvendo uma funcionalidade para que você mesmo possa 
                    criar e gerenciar seu perfil de forma independente.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <UserPlus className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Criação Simplificada</h3>
                      <p className="text-sm text-muted-foreground">
                        Interface intuitiva para criar seu perfil em poucos passos
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Personalização Total</h3>
                      <p className="text-sm text-muted-foreground">
                        Customize seu perfil com fotos, bio e informações importantes
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Verificação Automática</h3>
                      <p className="text-sm text-muted-foreground">
                        Sistema de verificação para garantir autenticidade
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Por que ter um Perfil ROLÊ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Star className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Visibilidade</h4>
                          <p className="text-sm text-muted-foreground">
                            Apareça nos resultados de busca e seja descoberto por novos fãs
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <MessageSquare className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Conexão Direta</h4>
                          <p className="text-sm text-muted-foreground">
                            Conecte-se diretamente com seu público e outros artistas
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Divulgação de Eventos</h4>
                          <p className="text-sm text-muted-foreground">
                            Promova seus shows e eventos para toda a comunidade ROLÊ
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Credibilidade</h4>
                          <p className="text-sm text-muted-foreground">
                            Perfil verificado aumenta a confiança do seu público
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20">
                <CardContent className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">
                    Quer criar seu perfil agora?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Entre em contato conosco e nossa equipe criará seu perfil 
                    personalizado na plataforma ROLÊ.
                  </p>
                  
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/contato">
                      <MessageSquare className="w-5 h-5" />
                      Falar com o ROLÊ
                    </Link>
                  </Button>
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    Resposta em até 24 horas
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PublicLayout>
    </PageWrapper>
  );
};

export default CreateProfileComingSoon;