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
const DestaquesHub = lazy(() => import("./pages/DestaquesHub"));
const CitiesPage = lazy(() => import("./pages/CitiesPage"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const HighlightsPage = lazy(() => import("./pages/HighlightsPage"));
const CityHighlightsPage = lazy(() => import("./pages/CityHighlightsPage"));
const CityHighlights = lazy(() => import("./pages/CityHighlights"));
const HighlightDetailPage = lazy(() => import("./pages/HighlightDetailPage"));

// Admin pages - lazy loaded for performance
const AdminLoginSimple = lazy(() => import("./pages/AdminLoginSimple"));
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword"));
const AdminSignup = lazy(() => import("./pages/AdminSignup"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

// Core admin pages for external routing
const HighlightsListPage = lazy(() => import("./pages/HighlightsListPage"));
const HighlightsCreatePage = lazy(() => import("./pages/HighlightsCreatePage"));

// Admin Simple - Nova versão direta
const AdminSimple = lazy(() => import("./pages/AdminSimple"));
const AdminSimpleForm = lazy(() => import("./pages/AdminSimpleForm"));

// Admin V2 - MVP System
const AdminV2Login = lazy(() => import("./pages/AdminV2Login"));
const AdminV2Dashboard = lazy(() => import("./pages/AdminV2Dashboard"));
const AdminHighlightsIndex = lazy(() => import("./pages/admin/highlights/Index"));
const AdminHighlightCreate = lazy(() => import("./pages/admin/highlights/Create"));
const AdminHighlightEdit = lazy(() => import("./pages/admin/highlights/Edit"));
const AdminEventsIndex = lazy(() => import("./pages/admin/events/Index"));
const AdminEventCreate = lazy(() => import("./pages/admin/events/Create"));
const AdminEventEdit = lazy(() => import("./pages/admin/events/Edit"));
const AdminVenuesIndex = lazy(() => import("./pages/admin/venues/Index"));
const AdminVenueCreate = lazy(() => import("./pages/admin/venues/Create"));
const AdminVenueEdit = lazy(() => import("./pages/admin/venues/Edit"));
const AdminOrganizersIndex = lazy(() => import("./pages/admin/organizers/Index"));
const AdminOrganizerCreate = lazy(() => import("./pages/admin/organizers/Create"));
const AdminOrganizerEdit = lazy(() => import("./pages/admin/organizers/Edit"));
const AdminArtistsIndex = lazy(() => import("./pages/admin/artists/Index"));
const AdminArtistCreate = lazy(() => import("./pages/admin/artists/Create"));
const AdminArtistEdit = lazy(() => import("./pages/admin/artists/Edit"));


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
                
                {/* Destaques Routes */}
                <Route path="/destaques" element={<DestaquesHub />} />
                <Route path="/destaques/:cidade" element={<CityHighlightsPage />} />
                <Route path="/destaque/:id" element={<HighlightDetailPage />} />
                <Route path="/destaques/:cidade/:data" element={<BlogArticle />} />
                <Route path="/cidades" element={<CitiesPage />} />
                
                {/* Highlights Routes */}
                <Route path="/highlights" element={<HighlightsPage />} />
                <Route path="/cidade/:cidade" element={<CityHighlights />} />
                
                {/* Admin Simple - Novo sistema direto */}
                <Route path="/admin-simple" element={<Suspense fallback={<AdminLoadingFallback />}><AdminSimple /></Suspense>} />
                <Route path="/admin-simple/create" element={<Suspense fallback={<AdminLoadingFallback />}><AdminSimpleForm /></Suspense>} />
                <Route path="/admin-simple/edit/:id" element={<Suspense fallback={<AdminLoadingFallback />}><AdminSimpleForm /></Suspense>} />

                {/* Admin V2 - MVP System */}
                <Route path="/admin-v2/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV2Login /></Suspense>} />
                <Route path="/admin-v2/*" element={<Suspense fallback={<AdminLoadingFallback />}><AdminLayout /></Suspense>} />


                {/* Admin Routes - Redirect to V2 */}
                <Route path="/admin/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminLoginSimple /></Suspense>} />
                <Route path="/admin/reset-password" element={<Suspense fallback={<AdminLoadingFallback />}><AdminResetPassword /></Suspense>} />
                <Route path="/admin/signup" element={<Suspense fallback={<AdminLoadingFallback />}><AdminSignup /></Suspense>} />
                <Route path="/admin/highlights" element={<Suspense fallback={<AdminLoadingFallback />}><HighlightsListPage /></Suspense>} />
                <Route path="/admin/highlights/create" element={<Suspense fallback={<AdminLoadingFallback />}><HighlightsCreatePage /></Suspense>} />
                <Route path="/admin/*" element={<Navigate to="/admin-v2/login" replace />} />
                
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