import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DevCacheButton } from "./components/DevCacheButton";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SpamPolicy from "./pages/SpamPolicy";
import UserTerms from "./pages/UserTerms";
import OrganizerTerms from "./pages/OrganizerTerms";
import Help from "./pages/Help";
import DestaquesHub from "./pages/DestaquesHub";
import BlogArticle from "./pages/BlogArticle";
import HighlightsPage from "./pages/HighlightsPage";
import CityHighlightsPage from "./pages/CityHighlightsPage";
import CityHighlights from "./pages/CityHighlights";
import HighlightDetailPage from "./pages/HighlightDetailPage";
import AdminLoginSimple from "./pages/AdminLoginSimple";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHighlightsManagement from "./pages/AdminHighlightsManagement";
import AdminHighlightEditor from "./pages/AdminHighlightEditor";
import AdminEventCreate from "./pages/AdminEventCreate";
import AdminPartnersManagement from "./pages/AdminPartnersManagement";
import AdminAdvertisements from "./pages/AdminAdvertisements";
import AdminPostEditor from "./pages/AdminPostEditor";
import AdminBlogPostsHistory from "./pages/AdminBlogPostsHistory";
import AdminCommentsManagement from "./pages/AdminCommentsManagement";
import AdminContactMessages from "./pages/AdminContactMessages";
import AdminVenuesManagement from "./pages/AdminVenuesManagement";
import AdminCategoriesManagement from "./pages/AdminCategoriesManagement";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminOrganizers from "./pages/admin/AdminOrganizers";
import AdminProfile from "./pages/AdminProfile";
import AdminPasswordUpdate from "./pages/AdminPasswordUpdate";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import WeeklyHighlights from "./pages/WeeklyHighlights";
import FeedPage from "./pages/FeedPage";
import CalendarPage from "./pages/CalendarPage";
import GamificationPage from "./pages/GamificationPage";
// Removed: GroupsPage, MusicPage, MusicCallbackPage
import NotFound from "./pages/NotFound";
import AdminMetricsIndex from "./pages/admin/metrics/Index";
import AdminTestimonialsIndex from "./pages/admin/testimonials/Index";
import AdminNotificationsPage from "./pages/admin/AdminNotifications";
import AdminAnalyticsReportsPage from "./pages/admin/AdminAnalyticsReports";
import AdminEventsManagementPage from "./pages/admin/AdminEventsManagement";
import AdminPerformancePage from "./pages/admin/AdminPerformance";
import AdminAdSensePage from "./pages/admin/AdminAdSense";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
// Removed: Chatbot import
import ScrollToTop from "./components/ScrollToTop";
import DiscoverUsers from "./pages/DiscoverUsers";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <ScrollToTop />
              <DevCacheButton />
              
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Static Pages */}
                <Route path="/sobre" element={<About />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
                <Route path="/politica-spam" element={<SpamPolicy />} />
                <Route path="/termos-usuario" element={<UserTerms />} />
                <Route path="/termos-organizador" element={<OrganizerTerms />} />
                <Route path="/ajuda" element={<Help />} />
                
                {/* Destaques Routes */}
                <Route path="/destaques" element={<DestaquesHub />} />
                <Route path="/destaques/:cidade" element={<CityHighlightsPage />} />
                <Route path="/destaque/:id" element={<HighlightDetailPage />} />
                <Route path="/destaques/:cidade/:data" element={<BlogArticle />} />
                
                {/* Highlights Routes */}
                <Route path="/highlights" element={<HighlightsPage />} />
                <Route path="/cidade/:cidade" element={<CityHighlights />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginSimple />} />
                <Route path="/admin/update-password" element={<AdminPasswordUpdate />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="highlights" element={<AdminHighlightsManagement />} />
                  <Route path="highlights/create" element={<AdminHighlightEditor />} />
                  <Route path="highlights/:id/edit" element={<AdminHighlightEditor />} />
                  <Route path="metrics" element={<AdminMetricsIndex />} />
                  <Route path="testimonials" element={<AdminTestimonialsIndex />} />
                  <Route path="event/create" element={<AdminEventCreate />} />
                  <Route path="partners/*" element={<AdminPartnersManagement />} />
                  <Route path="advertisements/*" element={<AdminAdvertisements />} />
                  <Route path="posts/new" element={<AdminPostEditor />} />
                  <Route path="posts/:id/edit" element={<AdminPostEditor />} />
                  <Route path="posts/history" element={<AdminBlogPostsHistory />} />
                  <Route path="comments" element={<AdminCommentsManagement />} />
                  <Route path="contact-messages" element={<AdminContactMessages />} />
                  <Route path="venues" element={<AdminVenuesManagement />} />
                  <Route path="categories" element={<AdminCategoriesManagement />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="analytics-reports" element={<AdminAnalyticsReportsPage />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  <Route path="events-management" element={<AdminEventsManagementPage />} />
                  <Route path="performance" element={<AdminPerformancePage />} />
                   <Route path="organizers" element={<AdminOrganizers />} />
                   <Route path="adsense" element={<AdminAdSensePage />} />
                   <Route path="newsletter" element={<AdminNewsletter />} />
                   <Route path="profile" element={<AdminProfile />} />
                </Route>
                
                {/* Events Routes */}
                <Route path="/eventos" element={<EventsPage />} />
                <Route path="/eventos/hoje" element={<EventsPage />} />
                <Route path="/eventos/:cidade" element={<EventsPage />} />
                <Route path="/evento/:id" element={<EventDetailPage />} />
                <Route path="/criar-evento" element={<CreateEventPage />} />
                
                {/* User Routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/descobrir" element={<DiscoverUsers />} />
                <Route path="/eventos/semana/:data" element={<WeeklyHighlights />} />
                <Route path="/calendario" element={<CalendarPage />} />
                <Route path="/conquistas" element={<GamificationPage />} />
                {/* Removed: Groups and Music routes */}
                
                {/* Catch-all route MUST be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Removed: Chatbot component */}
              <PWAInstallPrompt />
            </BrowserRouter>
          </ErrorBoundary>
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;