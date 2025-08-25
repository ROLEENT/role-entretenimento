import React, { useState } from 'react';
import { Trophy, Medal, Crown, Users } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRanking, RankingUser } from '@/hooks/useRanking';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface UserRankingProps {
  limit?: number;
  showUserPosition?: boolean;
  className?: string;
}

const UserRanking: React.FC<UserRankingProps> = ({
  limit = 10,
  showUserPosition = true,
  className
}) => {
  const { user } = useAuth();
  const { globalRanking, monthlyRanking, loading, getUserRank } = useRanking();
  const [activeTab, setActiveTab] = useState('global');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF'
    };
    return colors[level as keyof typeof colors] || colors.bronze;
  };

  const getLevelIcon = (level: string) => {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💠'
    };
    return icons[level as keyof typeof icons] || icons.bronze;
  };

  const RankingList = ({ users, type }: { users: RankingUser[], type: 'global' | 'monthly' }) => {
    const displayUsers = users.slice(0, limit);
    const userRank = user ? getUserRank(user.id, type) : null;
    const userInList = userRank && userRank <= limit;

    return (
      <div className="space-y-2">
        {displayUsers.map((rankUser, index) => (
          <div
            key={rankUser.user_id}
            className={cn(
              'flex items-center space-x-3 p-3 rounded-lg transition-colors',
              user && rankUser.user_id === user.id 
                ? 'bg-primary/10 border border-primary/20' 
                : 'hover:bg-accent/50',
              index < 3 && 'border border-border'
            )}
          >
            {/* Posição */}
            <div className="flex items-center justify-center w-8">
              {getRankIcon(rankUser.rank || index + 1)}
            </div>

            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={rankUser.profile?.avatar_url} />
              <AvatarFallback>
                {rankUser.profile?.display_name?.[0] || 
                 rankUser.profile?.username?.[0] || 
                 '?'}
              </AvatarFallback>
            </Avatar>

            {/* Informações do usuário */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-sm truncate">
                  {rankUser.profile?.display_name || 
                   rankUser.profile?.username || 
                   'Usuário'}
                </h4>
                <span className="text-lg">{getLevelIcon(rankUser.level)}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Nível {rankUser.level}</span>
                {rankUser.current_streak > 0 && (
                  <>
                    <span>•</span>
                    <span>🔥 {rankUser.current_streak} dias</span>
                  </>
                )}
              </div>
            </div>

            {/* Pontos */}
            <div className="text-right">
              <div className="font-bold text-primary">
                {type === 'global' 
                  ? rankUser.total_points.toLocaleString()
                  : rankUser.monthly_points.toLocaleString()
                }
              </div>
              <div className="text-xs text-muted-foreground">
                {type === 'global' ? 'pontos' : 'este mês'}
              </div>
            </div>
          </div>
        ))}

        {/* Posição do usuário se não estiver na lista */}
        {showUserPosition && user && userRank && !userInList && (
          <>
            <div className="border-t pt-2 mt-4">
              <div className="text-xs text-muted-foreground text-center mb-2">
                Sua posição
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-center w-8">
                  <span className="text-sm font-bold text-primary">#{userRank}</span>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.display_name?.[0] || 
                     user.user_metadata?.username?.[0] || 
                     user.email?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Você</h4>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">
                    {type === 'global' 
                      ? users.find(u => u.user_id === user.id)?.total_points?.toLocaleString() || '0'
                      : users.find(u => u.user_id === user.id)?.monthly_points?.toLocaleString() || '0'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {type === 'global' ? 'pontos' : 'este mês'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded" />
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-16 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Ranking de Usuários</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Geral</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Mensal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-4">
            <RankingList users={globalRanking} type="global" />
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <RankingList users={monthlyRanking} type="monthly" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserRanking;