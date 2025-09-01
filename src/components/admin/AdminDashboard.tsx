import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users, FileText, Bell } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

interface ClaimRequest {
  id: string;
  profile_handle: string;
  requester_email: string;
  verification_code: string;
  verification_method: string;
  status: string;
  created_at: string;
  verification_data: any;
}

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data: any;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'claims' | 'notifications'>('claims');

  const { data: claimRequests, isLoading: claimsLoading, error: claimsError } = useQuery({
    queryKey: ['admin-claim-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_claim_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClaimRequest[];
    }
  });

  const { data: notifications, isLoading: notificationsLoading, error: notificationsError } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as AdminNotification[];
    }
  });

  const approveClaimRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('profile_claim_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
      
      if (error) throw error;
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error approving claim:', error);
    }
  };

  const rejectClaimRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('profile_claim_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      
      if (error) throw error;
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting claim:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (claimsLoading || notificationsLoading) {
    return <LoadingState />;
  }

  if (claimsError || notificationsError) {
    return <ErrorState message="Erro ao carregar dados do painel administrativo" />;
  }

  const unreadNotifications = notifications?.filter(n => !n.is_read).length || 0;
  const pendingClaims = claimRequests?.filter(r => r.status === 'pending').length || 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie reivindicações de perfis e notificações</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Reivindicações Pendentes</p>
                <p className="text-2xl font-bold">{pendingClaims}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Notificações Não Lidas</p>
                <p className="text-2xl font-bold">{unreadNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Reivindicações</p>
                <p className="text-2xl font-bold">{claimRequests?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Notificações</p>
                <p className="text-2xl font-bold">{notifications?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'claims' ? 'default' : 'outline'}
          onClick={() => setActiveTab('claims')}
          className="relative"
        >
          Reivindicações
          {pendingClaims > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
              {pendingClaims}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'notifications' ? 'default' : 'outline'}
          onClick={() => setActiveTab('notifications')}
          className="relative"
        >
          Notificações
          {unreadNotifications > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
              {unreadNotifications}
            </Badge>
          )}
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reivindicações de Perfis</h2>
          {claimRequests?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Nenhuma reivindicação encontrada</p>
              </CardContent>
            </Card>
          ) : (
            claimRequests?.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">@{request.profile_handle}</CardTitle>
                    <Badge variant={
                      request.status === 'approved' ? 'default' : 
                      request.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }>
                      {request.status === 'pending' ? 'Pendente' :
                       request.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {request.requester_email}</p>
                    <p><strong>Método de Verificação:</strong> {request.verification_method}</p>
                    <p><strong>Código de Verificação:</strong> {request.verification_code}</p>
                    <p><strong>Data:</strong> {new Date(request.created_at).toLocaleDateString('pt-BR')}</p>
                    
                    {request.status === 'pending' && (
                      <div className="flex space-x-2 pt-4">
                        <Button 
                          onClick={() => approveClaimRequest(request.id)}
                          className="flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Aprovar</span>
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => rejectClaimRequest(request.id)}
                          className="flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Rejeitar</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notificações</h2>
          {notifications?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
              </CardContent>
            </Card>
          ) : (
            notifications?.map((notification) => (
              <Card key={notification.id} className={!notification.is_read ? 'border-blue-200 bg-blue-50/50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={notification.type === 'profile_claim' ? 'default' : 'secondary'}>
                        {notification.type}
                      </Badge>
                      {!notification.is_read && (
                        <Badge variant="destructive" className="h-2 w-2 p-0"></Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{notification.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(notification.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                  
                  {!notification.is_read && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="mt-3"
                    >
                      Marcar como lida
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}