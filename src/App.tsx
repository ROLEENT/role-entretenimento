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
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPostEditor from "./pages/AdminPostEditor";
import AdminEventCreate from "./pages/AdminEventCreate";
import AdminVenuesManagement from "./pages/AdminVenuesManagement";
import AdminCategoriesManagement from "./pages/AdminCategoriesManagement";
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
            {/* Blog Editorial Routes */}
            <Route path="/destaques" element={<DestaquesHub />} />
            <Route path="/destaques/:cidade" element={<CityBlogPage />} />
            <Route path="/destaques/:cidade/:data" element={<BlogArticle />} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/posts/new" element={<AdminPostEditor />} />
            <Route path="/admin/posts/:id/edit" element={<AdminPostEditor />} />
            <Route path="/admin/event/create" element={<AdminEventCreate />} />
            <Route path="/admin/venues" element={<AdminVenuesManagement />} />
            <Route path="/admin/categories" element={<AdminCategoriesManagement />} />
            {/* Events Routes */}
            <Route path="/eventos" element={<EventsPage />} />
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
