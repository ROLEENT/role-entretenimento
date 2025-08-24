import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, FileText, Calendar, MessageSquare } from 'lucide-react';

interface AdminStatsProps {
  className?: string;
}

export function AdminStats({ className }: AdminStatsProps) {
  const [stats, setStats] = useState({
    partners: 0,
    posts: 0,
    events: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [partnersResult, postsResult, eventsResult, messagesResult] = await Promise.all([
        supabase.from('partners').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        partners: partnersResult.count || 0,
        posts: postsResult.count || 0,
        events: eventsResult.count || 0,
        messages: messagesResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      title: 'Parceiros',
      value: stats.partners,
      icon: Users,
      description: 'Venues cadastrados',
      color: 'text-blue-600'
    },
    {
      title: 'Posts',
      value: stats.posts,
      icon: FileText,
      description: 'Artigos publicados',
      color: 'text-purple-600'
    },
    {
      title: 'Eventos',
      value: stats.events,
      icon: Calendar,
      description: 'Eventos cadastrados',
      color: 'text-pink-600'
    },
    {
      title: 'Mensagens',
      value: stats.messages,
      icon: MessageSquare,
      description: 'Contatos recebidos',
      color: 'text-green-600'
    }
  ];

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Estatísticas do Sistema</CardTitle>
        <CardDescription>
          Resumo dos dados cadastrados na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.title} className="text-center p-4 bg-muted/30 rounded-lg">
                <IconComponent className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium">{stat.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}