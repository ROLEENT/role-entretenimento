import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import CityHighlights from "./pages/CityHighlights";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AuthPage from "./pages/AuthPage";
import UserProfile from "./pages/UserProfile";
import WeeklyHighlights from "./pages/WeeklyHighlights";
import NotFound from "./pages/NotFound";
import AdminMetricsIndex from "./pages/admin/metrics/Index";
import AdminTestimonialsIndex from "./pages/admin/testimonials/Index";
import WeeklyHighlights from "./pages/WeeklyHighlights";
import DestaquesHub from "./pages/DestaquesHub";
import CityBlogPage from "./pages/CityBlogPage";
import BlogArticle from "./pages/BlogArticle";
import HighlightsPage from "./pages/HighlightsPage";
import CityHighlightsPage from "./pages/CityHighlightsPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SpamPolicy from "./pages/SpamPolicy";
import UserTerms from "./pages/UserTerms";
import OrganizerTerms from "./pages/OrganizerTerms";
import Help from "./pages/Help";
import AdminLoginSimple from "./pages/AdminLoginSimple";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPostEditor from "./pages/AdminPostEditor";
import AdminEventCreate from "./pages/AdminEventCreate";
import AdminVenuesManagement from "./pages/AdminVenuesManagement";
import AdminCategoriesManagement from "./pages/AdminCategoriesManagement";
import AdminAdvertisements from "./pages/AdminAdvertisements";
import AdminProfile from "./pages/AdminProfile";
import AdminBlogPostsHistory from "./pages/AdminBlogPostsHistory";
import AdminPartnersManagement from "./pages/AdminPartnersManagement";
import AdminContactMessages from "./pages/AdminContactMessages";
import AdminCommentsManagement from "./pages/AdminCommentsManagement";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminHighlightsManagement from "./pages/AdminHighlightsManagement";
import AdminHighlightEditor from "./pages/AdminHighlightEditor";
import AdminOrganizers from "./pages/admin/AdminOrganizers";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { DevCacheButton } from "./components/DevCacheButton";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="role-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Institutional Pages */}
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
            <Route path="/politica-spam" element={<SpamPolicy />} />
            <Route path="/termos-usuario" element={<UserTerms />} />
            <Route path="/termos-organizador" element={<OrganizerTerms />} />
            <Route path="/ajuda" element={<Help />} />
            {/* Blog Editorial Routes */}
            <Route path="/destaques" element={<DestaquesPage />} />
            <Route path="/destaques/:cidade" element={<DestaquesPage />} />
            <Route path="/destaques/:cidade/:data" element={<BlogArticle />} />
            {/* Highlights Routes */}
            <Route path="/highlights" element={<HighlightsPage />} />
            <Route path="/highlights/:cidade" element={<CityHighlightsPage />} />
            <Route path="/cidade/:cidade" element={<CityHighlights />} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginSimple />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="highlights" element={<AdminHighlightsManagement />} />
              <Route path="highlights/create" element={<AdminHighlightEditor />} />
              <Route path="highlights/edit/:id" element={<AdminHighlightEditor />} />
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
              <Route path="organizers" element={<AdminOrganizers />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
            <Route path="/eventos" element={<EventsPage />} />
            {/* Events Routes */}
            <Route path="/eventos/hoje" element={<EventsPage />} />
            <Route path="/eventos/:cidade" element={<EventsPage />} />
            <Route path="/evento/:id" element={<EventDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/perfil" element={<UserProfile />} />
            <Route path="/eventos/semana/:data" element={<WeeklyHighlights />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <ScrollToTop />
          <DevCacheButton />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
