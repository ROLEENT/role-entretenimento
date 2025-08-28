import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Award, Users, TrendingUp, Plus, Edit } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface GamificationStats {
  total_badges: number;
  active_badges: number;
  total_points_distributed: number;
  total_achievements: number;
  active_users: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  points_required: number;
  is_active: boolean;
  criteria: any;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
  user: {
    username?: string;
    display_name?: string;
  };
}

import { withAdminAuth } from '@/components/withAdminAuth';

function AdminGamification() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    setLoading(true);
    try {
      // Fetch badges
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch recent achievements
      const { data: achievementsData } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*),
          user:profiles(username, display_name)
        `)
        .order('earned_at', { ascending: false })
        .limit(10);

      // Calculate stats
      const totalBadges = badgesData?.length || 0;
      const activeBadges = badgesData?.filter(b => b.is_active).length || 0;
      
      setBadges(badgesData || []);
      setRecentAchievements(achievementsData || []);
      setStats({
        total_badges: totalBadges,
        active_badges: activeBadges,
        total_points_distributed: 12450, // Placeholder - could be fetched from points_history
        total_achievements: achievementsData?.length || 0,
        active_users: 156 // Placeholder
      });
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'trophy': return <Trophy className="h-4 w-4" />;
      case 'star': return <Star className="h-4 w-4" />;
      case 'award': return <Award className="h-4 w-4" />;
      default: return <Badge className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gamificação</h1>
        <p className="text-muted-foreground">
          Sistema de pontos, badges e conquistas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Badges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_badges || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Ativas</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_badges || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Distribuídos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_points_distributed?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_achievements || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_users || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas Recentes</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Gerenciar Badges</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Badge
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div style={{ color: badge.color }}>
                        {getBadgeIcon(badge.icon)}
                      </div>
                      <div>
                        <h4 className="font-medium">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {badge.points_required} pontos
                        </p>
                      </div>
                    </div>
                    <Badge variant={badge.is_active ? "default" : "secondary"}>
                      {badge.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {badge.description}
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Edit className="h-3 w-3 mr-2" />
                    Editar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="space-y-4">
            {recentAchievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div style={{ color: achievement.badge.color }}>
                      {getBadgeIcon(achievement.badge.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {achievement.user.display_name || achievement.user.username}
                        </span>
                        <span className="text-muted-foreground">conquistou</span>
                        <Badge style={{ backgroundColor: achievement.badge.color, color: 'white' }}>
                          {achievement.badge.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(achievement.earned_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                Ranking de usuários será implementado em breve
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAdminAuth(AdminGamification, 'admin');