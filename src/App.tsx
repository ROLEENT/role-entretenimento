import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FocusManagementProvider } from "@/components/FocusManagementProvider";
import { queryClient } from "@/lib/queryClient";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DevCacheButton } from "./components/DevCacheButton";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RequireAuth } from "@/components/RequireAuth";

// Preview component
const PreviewAgenda = lazy(() => import("./pages/PreviewAgenda"));
const ChecklistTest = lazy(() => import("./pages/ChecklistTest"));
// Dashboard components
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
import { DashboardRedirect } from "@/components/DashboardRedirect";
// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const SpamPolicy = lazy(() => import("./pages/SpamPolicy"));
const UserTerms = lazy(() => import("./pages/UserTerms"));
import { AdminLayout } from "@/components/AdminLayout";
import { AdminDashboard as NewAdminDashboard } from "@/pages/admin/AdminDashboard";
import { ApplicationsPage } from "@/pages/admin/ApplicationsPage";
import { ContactPage } from "@/pages/admin/ContactPage";
import { NewsletterPage } from "@/pages/admin/NewsletterPage";

const OrganizerTerms = lazy(() => import("./pages/OrganizerTerms"));
const Help = lazy(() => import("./pages/Help"));
const Agenda = lazy(() => import("./pages/Agenda"));
const AgendaCidade = lazy(() => import("./pages/AgendaCidade"));
const OutrasCidades = lazy(() => import("./pages/OutrasCidades"));
const AgendaDetailPage = lazy(() => import("./pages/AgendaDetailPage"));

// Layout components
const AgendaLayout = lazy(() => import("./components/layouts/AgendaLayout"));
// const DestaquesHub = lazy(() => import("./pages/DestaquesHub")); // Removido
const CitiesPage = lazy(() => import("./pages/CitiesPage"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const HighlightsPage = lazy(() => import("./pages/HighlightsPage"));
const CityHighlightsPage = lazy(() => import("./pages/CityHighlightsPage"));
const CityHighlights = lazy(() => import("./pages/CityHighlights"));
const HighlightDetailPage = lazy(() => import("./pages/HighlightDetailPage"));

// Admin pages - simple system
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
// Legacy AdminHighlightForm removed

// Admin V2 pages - advanced system
const AdminV2Login = lazy(() => import("./pages/AdminV2Login"));
const AdminV2Dashboard = lazy(() => import("./pages/AdminV2Dashboard"));

// Admin V3 pages - simplified system
const AdminV3Login = lazy(() => import("./pages/AdminV3Login"));
const AdminV3Dashboard = lazy(() => import("./pages/AdminV3Dashboard"));
const AdminV3Debug = lazy(() => import("./pages/AdminV3Debug"));
const AdminV3Agenda = lazy(() => import("./pages/AdminV3Agenda"));
const AdminV3Artists = lazy(() => import("./pages/AdminV3Artists"));
const AdminV3Agentes = lazy(() => import("./pages/AdminV3Agentes"));
const AdminV3Profile = lazy(() => import("./pages/AdminV3Profile"));
const AdminV3Contact = lazy(() => import("./pages/AdminV3Contact"));
const AdminV3Newsletter = lazy(() => import("./pages/AdminV3Newsletter"));
const AdminV3Categories = lazy(() => import("./pages/AdminV3Categories"));
const AdminV3Applications = lazy(() => import("./pages/AdminV3Applications"));

// Admin Blog components
const AdminBlogList = lazy(() => import("./components/admin/blog/AdminBlogList").then(module => ({ default: module.AdminBlogList })));

// Revista pages
const RevistaPage = lazy(() => import("./pages/RevistaPage"));
const RevistaArticlePage = lazy(() => import("./pages/RevistaArticlePage"));

// Institutional pages
const Parcerias = lazy(() => import("./pages/institucional/Parcerias"));
const TrabalheConosco = lazy(() => import("./pages/institucional/TrabalheConosco"));
const Imprensa = lazy(() => import("./pages/institucional/Imprensa"));

// User pages - lazy loaded
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Profile = lazy(() => import("./pages/Profile"));
const WeeklyHighlights = lazy(() => import("./pages/WeeklyHighlights"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const DiscoverUsers = lazy(() => import("./pages/DiscoverUsers"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ScrollToTop = lazy(() => import("./components/ScrollToTop"));

// Optimized loading components
const AdminLoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner />
      <p className="mt-4 text-muted-foreground">Carregando painel administrativo...</p>
    </div>
  </div>
);

const PageLoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner />
      <p className="mt-4 text-muted-foreground">Carregando página...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            <BrowserRouter>
              <FocusManagementProvider />
              <Suspense fallback={<PageLoadingFallback />}>
                <ScrollToTop />
                <DevCacheButton />
              
              <Routes>
                {/* Root redirect */}
                <Route path="/" element={<DashboardRedirect />} />
                
                {/* Home route for public */}
                <Route path="/home" element={<Index />} />
                
                {/* Static Pages */}
                <Route path="/sobre" element={<About />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
                <Route path="/politica-spam" element={<SpamPolicy />} />
                <Route path="/termos-usuario" element={<UserTerms />} />
                <Route path="/termos-organizador" element={<OrganizerTerms />} />
                <Route path="/ajuda" element={<Help />} />
                
                {/* Institutional Pages */}
                <Route path="/institucional/parcerias" element={<Parcerias />} />
                <Route path="/institucional/trabalhe-conosco" element={<TrabalheConosco />} />
                <Route path="/institucional/imprensa" element={<Imprensa />} />
                
                {/* Agenda Routes - Order matters for routing */}
                <Route path="/agenda" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><Agenda /></AgendaLayout></Suspense>} />
                <Route path="/agenda/outras-cidades" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><OutrasCidades /></AgendaLayout></Suspense>} />
                <Route path="/agenda/cidade/:cidade" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><AgendaCidade /></AgendaLayout></Suspense>} />
                <Route path="/agenda/:slug" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><AgendaDetailPage /></AgendaLayout></Suspense>} />
                
                {/* Preview Routes */}
                <Route path="/preview/agenda/:slug" element={<PreviewAgenda />} />
                
                {/* Test Routes */}
                <Route path="/test/checklist" element={<ChecklistTest />} />
                {/* Removed old test route */}
                
                {/* Revista Routes */}
                <Route path="/revista" element={<Suspense fallback={<PageLoadingFallback />}><RevistaPage /></Suspense>} />
                <Route path="/revista/:slug" element={<Suspense fallback={<PageLoadingFallback />}><RevistaArticlePage /></Suspense>} />
                
                {/* Rotas antigas de destaques removidas */}
                <Route path="/cidades" element={<CitiesPage />} />
                
                {/* Highlights Routes */}
                <Route path="/highlights" element={<HighlightsPage />} />
                <Route path="/cidade/:cidade" element={<CityHighlights />} />
                
            {/* New Dashboard Route */}
            <Route path="/dashboard" element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </Suspense>
            } />

            {/* Admin Panel Routes (legacy) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<NewAdminDashboard />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="newsletter" element={<NewsletterPage />} />
            </Route>

            {/* Legacy Simple Admin System */}
            <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Admin V2 System */}
                <Route path="/admin-v2/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV2Login /></Suspense>} />
                <Route path="/admin-v2/*" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV2Dashboard /></Suspense>} />
                
                {/* Admin V3 System */}
                <Route path="/admin-v3/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Login /></Suspense>} />
                <Route path="/admin-v3" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Dashboard /></Suspense>} />
                <Route path="/admin-v3/debug" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Debug /></Suspense>} />
                <Route path="/admin/v3/agenda" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Agenda /></Suspense>} />
                <Route path="/admin/v3/agenda/" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Agenda /></Suspense>} />
                {/* Redirect old artists routes to agentes */}
                <Route path="/admin-v3/artists" element={<Navigate to="/admin-v3/agentes" replace />} />
                <Route path="/admin-v3/artists/" element={<Navigate to="/admin-v3/agentes" replace />} />
                <Route path="/admin-v3/artists/create" element={<Navigate to="/admin-v3/agentes" replace />} />
                <Route path="/admin-v3/artists/create/" element={<Navigate to="/admin-v3/agentes" replace />} />
                <Route path="/admin-v3/artists/:id/edit" element={<Navigate to="/admin-v3/agentes" replace />} />
                <Route path="/admin-v3/artists/:id/edit/" element={<Navigate to="/admin-v3/agentes" replace />} />
                <Route path="/admin-v3/agentes" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Agentes /></Suspense>} />
                <Route path="/admin-v3/agentes/" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Agentes /></Suspense>} />
                {/* Admin Revista Routes */}
                <Route path="/admin-v3/revista" element={<Suspense fallback={<AdminLoadingFallback />}><AdminBlogList /></Suspense>} />
                <Route path="/admin-v3/revista/" element={<Suspense fallback={<AdminLoadingFallback />}><AdminBlogList /></Suspense>} />
                {/* Admin Gestão Routes */}
                <Route path="/admin-v3/contatos" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Contact /></Suspense>} />
                <Route path="/admin-v3/newsletter" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Newsletter /></Suspense>} />
                <Route path="/admin-v3/candidaturas" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Applications /></Suspense>} />
                <Route path="/admin-v3/profile" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Profile /></Suspense>} />
                <Route path="/admin-v3/categorias" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Categories /></Suspense>} />
                
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
                <Route path="/meu-calendario" element={
                  <RequireAuth>
                    <CalendarPage />
                  </RequireAuth>
                } />
                <Route path="/conquistas" element={<GamificationPage />} />
                {/* Removed: Groups and Music routes */}
                
                {/* Catch-all route MUST be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              </Suspense>
              <PWAInstallPrompt />
            </BrowserRouter>
          </ErrorBoundary>
          <Toaster />
          <Sonner />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;