import { Helmet } from 'react-helmet-async';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUserProfile } from '@/hooks/useUserProfile';
import { useUserAuth } from '@/hooks/useUserAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProfileEditFormV2 } from '@/components/profile/ProfileEditFormV2';
import { UserSavedEvents } from '@/components/profile/UserSavedEvents';
import { PersonalAgenda } from '@/components/account/PersonalAgenda';
import { UserFollowing } from '@/components/account/UserFollowing';
import { UserPreferences } from '@/components/account/UserPreferences';
import { AlertSystem } from '@/components/alerts/AlertSystem';

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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="salvos">Salvos</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="seguindo">Seguindo</TabsTrigger>
            <TabsTrigger value="preferencias">Preferências</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="perfil" className="space-y-6">
            <ProfileEditFormV2 />
          </TabsContent>
          
          <TabsContent value="salvos">
            <UserSavedEvents userId={user?.id} isOwner />
          </TabsContent>
          
          <TabsContent value="agenda">
            <PersonalAgenda />
          </TabsContent>
          
          <TabsContent value="seguindo">
            <UserFollowing />
          </TabsContent>
          
          <TabsContent value="preferencias">
            <UserPreferences />
          </TabsContent>
          
          <TabsContent value="alertas">
            <AlertSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}