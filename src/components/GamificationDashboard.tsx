import React, { useState } from 'react';
import { Trophy, Award, Target, TrendingUp, Calendar, Zap, Users } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PointsDisplay from './PointsDisplay';
import BadgeDisplay from './BadgeDisplay';
import UserRanking from './UserRanking';
import BadgeProgressCard from './BadgeProgressCard';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GamificationDashboardProps {
  className?: string;
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  className
}) => {
  const { user } = useAuth();
  const { 
    userBadges, 
    pointsHistory, 
    allBadges, 
    loading 
  } = useGamification();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sistema de Conquistas</h3>
          <p className="text-muted-foreground mb-4">
            Faça login para acompanhar seus pontos, badges e posição no ranking!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedBadges = userBadges.filter(ub => ub.badge);
  const availableBadges = allBadges.length;
  const completionRate = availableBadges > 0 ? (earnedBadges.length / availableBadges) * 100 : 0;

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Ranking</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pontos do usuário */}
            <div className="lg:col-span-1">
              <PointsDisplay showDetails={true} />
            </div>

            {/* Próximas conquistas */}
            <div className="lg:col-span-1">
              <BadgeProgressCard limit={3} />
            </div>

            {/* Resumo de badges */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Coleção de Badges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {earnedBadges.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      de {availableBadges} badges conquistados
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso da coleção</span>
                      <span className="font-medium">{completionRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Últimos badges conquistados */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Últimas conquistas</h4>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {earnedBadges.slice(0, 4).map((userBadge) => (
                        <BadgeDisplay
                          key={userBadge.id}
                          badge={userBadge.badge}
                          earned={true}
                          earnedAt={userBadge.earned_at}
                          size="sm"
                          className="flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ranking resumido */}
          <UserRanking limit={5} className="lg:col-span-full" />
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Badges conquistados */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span>Badges Conquistados</span>
                    </div>
                    <Badge variant="secondary">
                      {earnedBadges.length} de {availableBadges}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {earnedBadges.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {earnedBadges.map((userBadge) => (
                        <BadgeDisplay
                          key={userBadge.id}
                          badge={userBadge.badge}
                          earned={true}
                          earnedAt={userBadge.earned_at}
                          size="md"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum badge conquistado ainda</p>
                      <p className="text-sm mt-1">Participe de eventos para ganhar badges!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Próximas conquistas */}
            <div className="lg:col-span-1">
              <BadgeProgressCard />
            </div>
          </div>
        </TabsContent>

        {/* Ranking */}
        <TabsContent value="ranking" className="space-y-6">
          <UserRanking limit={20} />
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Histórico de Atividades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pointsHistory.length > 0 ? (
                <div className="space-y-3">
                  {pointsHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {entry.activity_type === 'checkin' && <Zap className="h-4 w-4 text-primary" />}
                          {entry.activity_type === 'review' && <Award className="h-4 w-4 text-primary" />}
                          {!['checkin', 'review'].includes(entry.activity_type) && <Target className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {entry.description || 'Atividade no ROLÊ'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.points > 0 ? '+' : ''}{entry.points}
                        </div>
                        <div className="text-xs text-muted-foreground">pontos</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma atividade registrada</p>
                  <p className="text-sm mt-1">Comece a participar para ver seu histórico!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationDashboard;