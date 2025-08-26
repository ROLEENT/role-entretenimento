import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminLoginSimple = () => {
  const [email, setEmail] = useState("fiih@roleentretenimento.com");
  const [password, setPassword] = useState("2025Fast!");
  const navigate = useNavigate();
  const { adminUser, loading, loginAdmin, isAuthenticated } = useAdminAuth();

  useEffect(() => {
    // Clear any existing localStorage to start fresh
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminUser');
    
    if (!loading && isAuthenticated) {
      navigate("/admin");
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Attempting login with:", { email, password: "***" });
      const result = await loginAdmin(email, password);
      console.log("Login result:", result);
      
      if (result.success) {
        toast.success("Login realizado com sucesso!");
        navigate("/admin");
      } else {
        toast.error(result.error || "Erro no login");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro inesperado no login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Admin ROLÊ
          </CardTitle>
          <CardDescription className="text-center">
            Acesse o painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@role.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate("/admin/signup")}
              className="text-sm"
            >
              Primeira vez? Criar conta admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginSimple;