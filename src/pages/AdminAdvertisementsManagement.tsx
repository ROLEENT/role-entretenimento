import { Helmet } from "react-helmet";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate, Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EnvironmentBanner } from '@/components/EnvironmentBanner';

const AdminAdvertisementsManagement = () => {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gerenciar Anúncios – ROLÊ ENTRETENIMENTO</title>
      </Helmet>

      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <EnvironmentBanner className="mb-6" />
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminAdvertisementsManagement;