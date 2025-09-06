import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Heart, Calendar, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function UserProfile() {
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - replace with real data fetching
  const user = {
    username: username || 'user',
    display_name: 'João Silva',
    bio: 'Apaixonado por música eletrônica e eventos culturais. DJ nas horas vagas.',
    avatar_url: null,
    followers_count: 156,
    following_count: 89,
    events_saved_count: 23,
    events_attended_count: 45,
    location: 'São Paulo, SP',
    member_since: '2023',
    is_verified: false
  };

  const savedEvents = [
    {
      id: '1',
      title: 'Festival de Música Eletrônica',
      date: '2024-02-15',
      venue: 'Allianz Parque',
      image_url: '/placeholder.svg'
    },
    {
      id: '2', 
      title: 'Show de Rock Nacional',
      date: '2024-02-20',
      venue: 'Espaço das Américas',
      image_url: '/placeholder.svg'
    }
  ];

  const attendedEvents = [
    {
      id: '3',
      title: 'Festa de Ano Novo',
      date: '2023-12-31',
      venue: 'Club Xxx',
      status: 'went'
    }
  ];

  const following = [
    {
      id: '1',
      name: 'Alok',
      type: 'artist',
      image_url: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Villa Mix',
      type: 'venue', 
      image_url: '/placeholder.svg'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatar_url || undefined} alt={user.display_name} />
                <AvatarFallback className="text-lg">
                  {user.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={() => setIsFollowing(!isFollowing)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{user.display_name}</h1>
                {user.is_verified && (
                  <Badge variant="secondary">Verificado</Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-2">@{user.username}</p>
              
              {user.bio && (
                <p className="text-sm mb-4">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {user.location && (
                  <span>📍 {user.location}</span>
                )}
                <span>📅 Membro desde {user.member_since}</span>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold text-foreground">{user.followers_count}</span>
                  <span className="text-muted-foreground ml-1">seguidores</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">{user.following_count}</span>
                  <span className="text-muted-foreground ml-1">seguindo</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">{user.events_saved_count}</span>
                  <span className="text-muted-foreground ml-1">eventos salvos</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">{user.events_attended_count}</span>
                  <span className="text-muted-foreground ml-1">eventos</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="h-4 w-4" />
            Salvos
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Calendar className="h-4 w-4" />
            Presenças
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Seguindo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {user.bio || 'Este usuário ainda não adicionou uma biografia.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Salvos ({savedEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {savedEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.venue}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos que Participou ({attendedEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendedEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.venue} • {event.date}</p>
                    </div>
                    <Badge variant="outline">Participou</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguindo ({following.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {following.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.image_url} alt={item.name} />
                      <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                    </div>
                    <Badge variant="outline">{item.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}