import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Analytics & Métricas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Acompanhe o desempenho da plataforma ROLÊ com métricas detalhadas 
                sobre eventos, visualizações e engajamento dos usuários.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <AnalyticsDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default AdminAnalytics;