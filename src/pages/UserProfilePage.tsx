import { Helmet } from 'react-helmet-async';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUserProfile } from '@/hooks/useUserProfile';
import { useUserAuth } from '@/hooks/useUserAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { UserSavedEvents } from '@/components/profile/UserSavedEvents';
import { UserAttendances } from '@/components/profile/UserAttendances';
import { UserNotifications } from '@/components/profile/UserNotifications';

export default function UserProfilePage() {
  const { user, isAuthenticated } = useUserAuth();
  const { data: profile, isLoading } = useCurrentUserProfile();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'perfil';

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Meu Perfil - Rolezeiro</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Conta</h1>
          <p className="text-muted-foreground">
            Gerencie seu perfil e preferências do Rolezeiro
          </p>
        </div>

        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="salvos">Meus Salvos</TabsTrigger>
            <TabsTrigger value="presencas">Presenças</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="perfil" className="space-y-6">
            <ProfileEditForm profile={profile} />
          </TabsContent>
          
          <TabsContent value="salvos">
            <UserSavedEvents userId={user?.id} isOwner />
          </TabsContent>
          
          <TabsContent value="presencas">
            <UserAttendances userId={user?.id} isOwner />
          </TabsContent>
          
          <TabsContent value="notificacoes">
            <UserNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}