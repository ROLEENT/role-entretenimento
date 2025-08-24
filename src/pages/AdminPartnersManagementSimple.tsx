import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Partner {
  id: string;
  name: string;
  location: string;
  types: string[];
  website?: string;
  instagram?: string;
  contact_email?: string;
  capacity?: string;
  featured: boolean;
  rating: number;
  image_url?: string;
  created_at: string;
}

const AdminPartnersManagementSimple = () => {
  const { isAuthenticated } = useAdminAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPartners();
    }
  }, [isAuthenticated]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Parceiros</h1>
            <p className="text-muted-foreground mt-2">
              Visualizar e gerenciar parceiros da plataforma
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <Card key={partner.id}>
              <CardHeader>
                <CardTitle className="text-lg">{partner.name}</CardTitle>
                <CardDescription>{partner.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {partner.types.length > 0 && (
                    <p className="text-sm"><strong>Tipos:</strong> {partner.types.join(', ')}</p>
                  )}
                  {partner.capacity && (
                    <p className="text-sm"><strong>Capacidade:</strong> {partner.capacity}</p>
                  )}
                  {partner.website && (
                    <p className="text-sm"><strong>Website:</strong> 
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                        {partner.website}
                      </a>
                    </p>
                  )}
                  {partner.instagram && (
                    <p className="text-sm"><strong>Instagram:</strong> {partner.instagram}</p>
                  )}
                  {partner.contact_email && (
                    <p className="text-sm"><strong>Email:</strong> {partner.contact_email}</p>
                  )}
                  <p className="text-sm"><strong>Avaliação:</strong> {partner.rating}/5.0</p>
                  <p className="text-sm"><strong>Destacado:</strong> {partner.featured ? 'Sim' : 'Não'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {partners.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhum parceiro encontrado.</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminPartnersManagementSimple;