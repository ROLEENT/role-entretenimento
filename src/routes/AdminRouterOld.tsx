import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Dashboard
import AdminDashboard from '@/pages/admin/Dashboard';

// Content Management
import AdminHighlights from '@/pages/admin/highlights/Index';
import AdminHighlightCreate from '@/pages/admin/highlights/Create';
import AdminHighlightEdit from '@/pages/admin/highlights/Edit';

import AdminEvents from '@/pages/admin/events/Index';
import AdminEventCreate from '@/pages/admin/events/Create';
import AdminEventEdit from '@/pages/admin/events/Edit';

import AdminBlog from '@/pages/admin/blog/Index';
import AdminBlogCreate from '@/pages/admin/blog/Create';
import AdminBlogEdit from '@/pages/admin/blog/Edit';
import AdminBlogHistory from '@/pages/admin/blog/History';

import AdminCategories from '@/pages/admin/categories/Index';
import AdminVenues from '@/pages/admin/venues/Index';

// User Management
import AdminProfiles from '@/pages/admin/profiles/Index';
import AdminComments from '@/pages/admin/comments/Index';
import AdminContactMessages from '@/pages/admin/contact-messages/Index';
import AdminOrganizers from '@/pages/admin/organizers/Index';

// Marketing & Monetization
import AdminPartners from '@/pages/admin/partners/Index';
import AdminAdvertisements from '@/pages/admin/advertisements/Index';

import AdminNewsletter from '@/pages/admin/newsletter/Index';
import AdminPushNotifications from '@/pages/admin/push-notifications/Index';

// Analytics & Reports
import AdminAnalytics from '@/pages/admin/analytics/Index';
import AdminReports from '@/pages/admin/reports/Index';
import AdminPerformance from '@/pages/admin/performance/Index';

// System & Settings
import AdminGamification from '@/pages/admin/gamification/Index';
import AdminSettings from '@/pages/admin/settings/Index';
import AdminProfile from '@/pages/admin/profile/Index';

export default function AdminRouterOld() {
  return (
    <>
      <Helmet>
        <title>Admin (Antigo) - Plataforma Role</title>
        <meta name="description" content="Painel administrativo da plataforma Role - Versão Antiga" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Routes>
        {/* Dashboard */}
        <Route index element={<AdminDashboard />} />
        
        {/* Content Management */}
        <Route path="highlights" element={<AdminHighlights />} />
        <Route path="highlights/create" element={<AdminHighlightCreate />} />
        <Route path="highlights/:id/edit" element={<AdminHighlightEdit />} />
        
        <Route path="events" element={<AdminEvents />} />
        <Route path="events/create" element={<AdminEventCreate />} />
        <Route path="events/:id/edit" element={<AdminEventEdit />} />
        
        <Route path="blog" element={<AdminBlog />} />
        <Route path="blog/create" element={<AdminBlogCreate />} />
        <Route path="blog/:id/edit" element={<AdminBlogEdit />} />
        <Route path="blog/history" element={<AdminBlogHistory />} />
        
        <Route path="categories" element={<AdminCategories />} />
        <Route path="venues" element={<AdminVenues />} />
        
        {/* User Management */}
        <Route path="profiles" element={<AdminProfiles />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="contact-messages" element={<AdminContactMessages />} />
        <Route path="organizers" element={<AdminOrganizers />} />
        
        {/* Marketing & Monetization */}
        <Route path="partners" element={<AdminPartners />} />
        <Route path="partners/:id/edit" element={<AdminPartners />} />
        <Route path="partners/new" element={<AdminPartners />} />
        
        <Route path="advertisements" element={<AdminAdvertisements />} />
        <Route path="advertisements/:id/edit" element={<AdminAdvertisements />} />
        <Route path="advertisements/new" element={<AdminAdvertisements />} />
        
        
        <Route path="newsletter" element={<AdminNewsletter />} />
        <Route path="push-notifications" element={<AdminPushNotifications />} />
        
        {/* Analytics & Reports */}
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="performance" element={<AdminPerformance />} />
        
        {/* System & Settings */}
        <Route path="gamification" element={<AdminGamification />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Routes>
    </>
  );
}