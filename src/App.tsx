import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import CityHighlights from "./pages/CityHighlights";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AuthPage from "./pages/AuthPage";
import UserProfile from "./pages/UserProfile";
import WeeklyHighlights from "./pages/WeeklyHighlights";
import DestaquesHub from "./pages/DestaquesHub";
import CityBlogPage from "./pages/CityBlogPage";
import BlogArticle from "./pages/BlogArticle";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SpamPolicy from "./pages/SpamPolicy";
import UserTerms from "./pages/UserTerms";
import OrganizerTerms from "./pages/OrganizerTerms";
import Help from "./pages/Help";
import AdminLoginSimple from "./pages/AdminLoginSimple";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPostEditor from "./pages/AdminPostEditor";
import AdminEventCreate from "./pages/AdminEventCreate";
import AdminVenuesManagement from "./pages/AdminVenuesManagement";
import AdminCategoriesManagement from "./pages/AdminCategoriesManagement";
import AdminAdvertisementsManagement from "./pages/AdminAdvertisementsManagement";
import AdminProfile from "./pages/AdminProfile";
import AdminBlogPostsHistory from "./pages/AdminBlogPostsHistory";
import AdminPartnersManagement from "./pages/AdminPartnersManagement";
import AdminContactMessages from "./pages/AdminContactMessages";
import AdminCommentsManagement from "./pages/AdminCommentsManagement";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="role-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <Route path="/destaques" element={<DestaquesHub />} />
            <Route path="/destaques/:cidade" element={<CityBlogPage />} />
            <Route path="/destaques/:cidade/:data" element={<BlogArticle />} />
            <Route path="/cidade/:cidade" element={<CityHighlights />} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginSimple />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/posts/new" element={<AdminPostEditor />} />
            <Route path="/admin/posts/:id/edit" element={<AdminPostEditor />} />
            <Route path="/admin/event/create" element={<AdminEventCreate />} />
            <Route path="/admin/venues" element={<AdminVenuesManagement />} />
            <Route path="/admin/categories" element={<AdminCategoriesManagement />} />
            <Route path="/admin/partners" element={<AdminPartnersManagement />} />
            <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
            <Route path="/admin/comments" element={<AdminCommentsManagement />} />
            <Route path="/admin/posts/history" element={<AdminBlogPostsHistory />} />
            <Route path="/admin/advertisements" element={<AdminAdvertisementsManagement />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
