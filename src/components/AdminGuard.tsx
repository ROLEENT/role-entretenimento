import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading, isAdmin, role } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ShieldX className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa ter permissões de administrador para acessar esta área.
            </p>
            <p className="text-sm text-muted-foreground">
              Role atual: <strong>{role || 'viewer'}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};