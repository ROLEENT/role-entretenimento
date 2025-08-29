import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { queryClient } from "@/lib/queryClient";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DevCacheButton } from "./components/DevCacheButton";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const SpamPolicy = lazy(() => import("./pages/SpamPolicy"));
const UserTerms = lazy(() => import("./pages/UserTerms"));
const OrganizerTerms = lazy(() => import("./pages/OrganizerTerms"));
const Help = lazy(() => import("./pages/Help"));
const Agenda = lazy(() => import("./pages/Agenda"));
const DestaquesHub = lazy(() => import("./pages/DestaquesHub"));
const CitiesPage = lazy(() => import("./pages/CitiesPage"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const HighlightsPage = lazy(() => import("./pages/HighlightsPage"));
const CityHighlightsPage = lazy(() => import("./pages/CityHighlightsPage"));
const CityHighlights = lazy(() => import("./pages/CityHighlights"));
const HighlightDetailPage = lazy(() => import("./pages/HighlightDetailPage"));

// Admin pages - simple system
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminHighlightForm = lazy(() => import("./pages/AdminHighlightForm"));

// Admin V2 pages - advanced system
const AdminV2Login = lazy(() => import("./pages/AdminV2Login"));
const AdminV2Dashboard = lazy(() => import("./pages/AdminV2Dashboard"));

// Admin V3 pages - simplified system
const AdminV3Login = lazy(() => import("./pages/AdminV3Login"));
const AdminV3Dashboard = lazy(() => import("./pages/AdminV3Dashboard"));
const AdminV3Debug = lazy(() => import("./pages/AdminV3Debug"));
const AdminV3Agenda = lazy(() => import("./pages/AdminV3Agenda"));
const AdminV3AgendaCreate = lazy(() => import("./pages/AdminV3AgendaCreate"));
const AdminV3AgendaEdit = lazy(() => import("./pages/AdminV3AgendaEdit"));
const AdminV3Profile = lazy(() => import("./pages/AdminV3Profile"));

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
        <ThemeProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<PageLoadingFallback />}>
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
                
                {/* Agenda Routes */}
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/agenda/:cidade" element={<Agenda />} />
                
                {/* Destaques Routes */}
                <Route path="/destaques" element={<DestaquesHub />} />
                <Route path="/destaques/:cidade" element={<CityHighlightsPage />} />
                <Route path="/destaque/:id" element={<HighlightDetailPage />} />
                <Route path="/destaques/:cidade/:data" element={<BlogArticle />} />
                <Route path="/cidades" element={<CitiesPage />} />
                
                {/* Highlights Routes */}
                <Route path="/highlights" element={<HighlightsPage />} />
                <Route path="/cidade/:cidade" element={<CityHighlights />} />
                
                {/* Simple Admin System */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/highlights/create" element={<AdminHighlightForm />} />
                <Route path="/admin/highlights/:id/edit" element={<AdminHighlightForm />} />
                
                {/* Admin V2 System */}
                <Route path="/admin-v2/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV2Login /></Suspense>} />
                <Route path="/admin-v2/*" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV2Dashboard /></Suspense>} />
                
                {/* Admin V3 System */}
                <Route path="/admin-v3/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Login /></Suspense>} />
                <Route path="/admin-v3" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Dashboard /></Suspense>} />
                <Route path="/admin-v3/debug" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Debug /></Suspense>} />
                <Route path="/admin-v3/agenda" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Agenda /></Suspense>} />
                <Route path="/admin-v3/agenda/" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Agenda /></Suspense>} />
                <Route path="/admin-v3/agenda/create" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3AgendaCreate /></Suspense>} />
                <Route path="/admin-v3/agenda/create/" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3AgendaCreate /></Suspense>} />
                <Route path="/admin-v3/agenda/:id/edit" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3AgendaEdit /></Suspense>} />
                <Route path="/admin-v3/agenda/:id/edit/" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3AgendaEdit /></Suspense>} />
                <Route path="/admin-v3/agenda/new" element={<Navigate to="/admin-v3/agenda/create" replace />} />
                <Route path="/admin-v3/agenda/new/" element={<Navigate to="/admin-v3/agenda/create" replace />} />
                <Route path="/admin-v3/profile" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Profile /></Suspense>} />
                
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