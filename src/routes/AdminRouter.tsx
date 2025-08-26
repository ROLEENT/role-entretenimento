import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminEventManagement from '@/pages/AdminEventManagement';
import AdminEventCreate from '@/pages/AdminEventCreate';
import AdminEventEdit from '@/pages/AdminEventEdit';
import AdminHighlightsManagement from '@/pages/AdminHighlightsManagement';
import AdminHighlightEditor from '@/pages/AdminHighlightEditor';
import AdminPostEditor from '@/pages/AdminPostEditor';
import AdminBlogPostsHistory from '@/pages/AdminBlogPostsHistory';
import AdminCategoriesManagement from '@/pages/AdminCategoriesManagement';
import AdminVenuesManagement from '@/pages/AdminVenuesManagement';
import AdminOrganizers from '@/pages/AdminOrganizers';
import AdminContactMessages from '@/pages/AdminContactMessages';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AdminProfile from '@/pages/AdminProfile';
import AdminNotifications from '@/pages/AdminNotifications';
import AdminPerformance from '@/pages/AdminPerformance';
import AdminCommentsManagement from '@/pages/AdminCommentsManagement';
import AdminAdvertisements from '@/pages/AdminAdvertisements';
import AdminPushNotifications from '@/pages/admin/AdminPushNotifications';
import AdminReports from '@/pages/admin/AdminReports';
import AdminPerformanceMonitor from '@/pages/admin/AdminPerformanceMonitor';

const AdminRouter = () => {
  return (
    <>
      <Helmet>
        <title>Admin - Plataforma Role</title>
        <meta name="description" content="Painel administrativo da plataforma Role" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Routes>
        {/* Dashboard Principal */}
        <Route path="/" element={<AdminDashboard />} />
        
        {/* Gestão de Eventos */}
        <Route path="/events" element={<AdminEventManagement />} />
        <Route path="/events/create" element={<AdminEventCreate />} />
        <Route path="/events/edit/:id" element={<AdminEventEdit />} />
        
        {/* Gestão de Destaques */}
        <Route path="/highlights" element={<AdminHighlightsManagement />} />
        <Route path="/highlights/create" element={<AdminHighlightEditor />} />
        <Route path="/highlights/edit/:id" element={<AdminHighlightEditor />} />
        
        {/* Gestão de Posts/Blog */}
        <Route path="/posts/new" element={<AdminPostEditor />} />
        <Route path="/posts/edit/:id" element={<AdminPostEditor />} />
        <Route path="/posts/history" element={<AdminBlogPostsHistory />} />
        
        {/* Gestão de Categorias */}
        <Route path="/categories" element={<AdminCategoriesManagement />} />
        
        {/* Gestão de Venues */}
        <Route path="/venues" element={<AdminVenuesManagement />} />
        
        {/* Gestão de Organizadores */}
        <Route path="/organizers" element={<AdminOrganizers />} />
        
        {/* Gestão de Comentários */}
        <Route path="/comments" element={<AdminCommentsManagement />} />
        
        {/* Gestão de Mensagens de Contato */}
        <Route path="/contact" element={<AdminContactMessages />} />
        
        {/* Push Notifications */}
        <Route path="/notifications" element={<AdminNotifications />} />
        <Route path="/push-notifications" element={<AdminPushNotifications />} />
        
        {/* Relatórios e Analytics */}
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/reports" element={<AdminReports />} />
        
        {/* Performance e Monitoramento */}
        <Route path="/performance" element={<AdminPerformance />} />
        <Route path="/performance-monitor" element={<AdminPerformanceMonitor />} />
        
        {/* Gestão de Anúncios */}
        <Route path="/advertisements" element={<AdminAdvertisements />} />
        
        {/* Perfil do Admin */}
        <Route path="/profile" element={<AdminProfile />} />
      </Routes>
    </>
  );
};

export default AdminRouter;