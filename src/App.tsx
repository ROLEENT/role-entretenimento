import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalSEO } from "@/components/seo/GlobalSEO";
import { FocusManagementProvider } from "@/components/FocusManagementProvider";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/auth/AuthContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DevCacheButton } from "./components/DevCacheButton";
import { RoleNoticePopup } from "@/components/RoleNoticePopup";
import React, { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RequireAuth } from "@/components/RequireAuth";

// Preview component
const PreviewAgenda = lazy(() => import("./pages/PreviewAgenda"));

// Home and Agenda pages
const Home = lazy(() => import("./pages/Home"));
const AgendaList = lazy(() => import("./pages/AgendaList"));
const AgendaDetail = lazy(() => import("./pages/AgendaDetail"));
const AgendaCity = lazy(() => import("./pages/AgendaCity"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const SpamPolicy = lazy(() => import("./pages/SpamPolicy"));
const UserTerms = lazy(() => import("./pages/UserTerms"));

// User Profile Pages
const PublicUserProfilePage = lazy(() => import("./pages/PublicUserProfilePage"));
const PublicUserProfilePageV2 = lazy(() => import("./pages/PublicUserProfilePageV2"));
const MePage = lazy(() => import("./pages/MePage"));
// RolezeirosPage removed

const OrganizerTerms = lazy(() => import("./pages/OrganizerTerms"));
const PoliticaCuradoria = lazy(() => import("./pages/PoliticaCuradoria"));
const Help = lazy(() => import("./pages/Help"));

// Institutional pages (Briefing 3)
const FAQ = lazy(() => import("./pages/institutional/FAQ"));
const HowToPublishProfile = lazy(() => import("./pages/institutional/HowToPublishProfile"));
const HowToPromoteEvent = lazy(() => import("./pages/institutional/HowToPromoteEvent"));
const RolezeiraPolicies = lazy(() => import("./pages/institutional/RolezeiraPolicies"));
const GeneralUsePolicies = lazy(() => import("./pages/institutional/GeneralUsePolicies"));
const OrganizerPolicies = lazy(() => import("./pages/institutional/OrganizerPolicies"));
const ContactUs = lazy(() => import("./pages/institutional/ContactUs"));
// Agenda pages removed

// Layout components
const AgendaLayout = lazy(() => import("./components/layouts/AgendaLayout"));
const CitiesPage = lazy(() => import("./pages/CitiesPage"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
// HighlightsPage and CityHighlightsPage removed
// CityHighlights removed - depends on deleted admin components
// HighlightDetailPage removed - depends on deleted admin components

// Revista pages
const RevistaPage = lazy(() => import("./pages/RevistaPage"));
const RevistaArticlePage = lazy(() => import("./pages/RevistaArticlePage"));

// Institutional pages
const InstitucionalIndex = lazy(() => import("./pages/institucional/InstitucionalIndex"));
const Parcerias = lazy(() => import("./pages/institucional/Parcerias"));
const TrabalheConosco = lazy(() => import("./pages/institucional/TrabalheConosco"));
const Imprensa = lazy(() => import("./pages/institucional/Imprensa"));

// User pages - lazy loaded
// const EventsPage = lazy(() => import("./pages/EventsPage")); // Removed as requested
// EventDetailPageV2 removed - depends on deleted admin components
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PublicAuthPage = lazy(() => import("./pages/PublicAuthPage"));
const ClaimProfilePage = lazy(() => import("./pages/ClaimProfilePage"));
// Profile and WeeklyHighlights removed - depend on deleted admin components
const FeedPage = lazy(() => import("./pages/FeedPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const DiscoverUsers = lazy(() => import("./pages/DiscoverUsers"));
// CreateProfileComingSoon removed
// FavoritosPage removed
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage").then(module => ({ default: module.PublicProfilePage })));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const SavesPage = lazy(() => import("./pages/SavesPage").then(module => ({ default: module.SavesPage })));
const NotFound = lazy(() => import("./pages/NotFound"));
const ServerError = lazy(() => import("./pages/ServerError"));
const ScrollToTop = lazy(() => import("./components/ScrollToTop"));
const DebugCombo = lazy(() => import("./pages/DebugCombo"));
const TestPage = lazy(() => import("./pages/TestPage"));
const Fase5DemoPage = lazy(() => import("./pages/Fase5DemoPage"));

// V5 Pages removed - depend on deleted admin components

// Profiles pages removed - depend on deleted features/profiles
const SearchPage = lazy(() => import("./pages/SearchPage"));

// Handle @username redirects
function HandleRedirect() {
  const { raw = "" } = useParams();
  if (raw.startsWith("@")) return <Navigate to={`/perfil/${raw.slice(1)}`} replace />;
  return <Navigate to="/404" replace />;
}

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
          <GlobalSEO />
          <AuthProvider>
            <ErrorBoundary>
              <BrowserRouter>
              <FocusManagementProvider />
                <Suspense fallback={<PageLoadingFallback />}>
                <ScrollToTop />
                <DevCacheButton />
                <RoleNoticePopup 
                  whatsNumber={import.meta.env.VITE_ROLE_WHATS_NUMBER || "5551980704353"}
                  snoozeDays={7}
                />
              
              <Routes>
                {/* Home */}
                <Route path="/" element={<Home />} />
                
                {/* Agenda Routes */}
                <Route path="/agenda" element={<AgendaList />} />
                <Route path="/agenda/:slug" element={<AgendaDetail />} />
                <Route path="/agenda/cidade/:city" element={<AgendaCity />} />
                
                {/* Demo page route */}
                <Route path="/fase5-demo" element={<Fase5DemoPage />} />
                
                {/* Static Pages */}
                <Route path="/sobre" element={<About />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
                <Route path="/politica-spam" element={<SpamPolicy />} />
                <Route path="/termos-usuario" element={<UserTerms />} />
                <Route path="/termos-organizador" element={<OrganizerTerms />} />
                <Route path="/politicas/curadoria" element={<PoliticaCuradoria />} />
                <Route path="/ajuda" element={<Help />} />
                
                {/* Institutional Pages - Briefing 3 */}
                <Route path="/faq" element={<FAQ />} />
                <Route path="/como-ter-perfil-publicado" element={<HowToPublishProfile />} />
                <Route path="/como-divulgar-evento" element={<HowToPromoteEvent />} />
                <Route path="/politicas-rolezeira" element={<RolezeiraPolicies />} />
                <Route path="/politicas-uso" element={<GeneralUsePolicies />} />
                <Route path="/politicas-organizador" element={<OrganizerPolicies />} />
                <Route path="/fale-conosco" element={<ContactUs />} />
                
                {/* Institutional Pages */}
                <Route path="/institucional" element={<InstitucionalIndex />} />
                <Route path="/institucional/parcerias" element={<Parcerias />} />
                <Route path="/institucional/trabalhe-conosco" element={<TrabalheConosco />} />
                <Route path="/institucional/imprensa" element={<Imprensa />} />
                
                {/* Agenda Routes removed */}
                
                {/* Preview Routes */}
                <Route path="/preview/agenda/:slug" element={<PreviewAgenda />} />
                
                {/* Test Routes removed */}
                <Route path="/test" element={<TestPage />} />
                <Route path="/debug/combo" element={<DebugCombo />} />
                {/* Removed old test route */}
                
                {/* Revista Routes */}
                <Route path="/revista" element={<Suspense fallback={<PageLoadingFallback />}><RevistaPage /></Suspense>} />
                <Route path="/revista/:slug" element={<Suspense fallback={<PageLoadingFallback />}><RevistaArticlePage /></Suspense>} />
                
                {/* Profiles Routes removed */}
                
                {/* Search Route */}
                <Route path="/buscar" element={<Suspense fallback={<PageLoadingFallback />}><SearchPage /></Suspense>} />
                
                {/* Public Profile Routes */}
                <Route path="/u/:username" element={<Suspense fallback={<PageLoadingFallback />}><PublicUserProfilePageV2 /></Suspense>} />
                
                {/* User Profile Route */}
                <Route path="/usuario/:username" element={<Suspense fallback={<PageLoadingFallback />}><UserProfile /></Suspense>} />
                
                {/* Profile Creation Routes removed */}
                <Route path="/criar/perfil" element={<div>Em construção</div>} />
                
                {/* Highlights Routes removed */}
                {/* CityHighlights removed */}
                
                {/* Events Routes - /eventos permanently removed as requested */}
                {/* Redirect old /eventos routes to /agenda */}
                <Route path="/eventos" element={<Navigate to="/agenda" replace />} />
                <Route path="/eventos/*" element={<Navigate to="/agenda" replace />} />
                {/* EventDetailPageV2 removed */}
                <Route path="/criar-evento" element={<CreateEventPage />} />
                
                {/* User Routes */}
                <Route path="/auth" element={<AuthPage />} />
                {/* Profile removed */}
                <Route path="/criar-perfil" element={<div>Em construção</div>} />
                {/* User dashboard removed */}
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/descobrir" element={<DiscoverUsers />} />
                {/* WeeklyHighlights removed */}
                {/* Rolezeiros Routes */}
                <Route path="/me" element={<Suspense fallback={<PageLoadingFallback />}><MePage /></Suspense>} />
                
                {/* Legacy User Profile Routes */}
                <Route path="/u/:username" element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <PublicUserProfilePageV2 />
                  </Suspense>
                } />
                
                <Route path="/meu-calendario" element={
                  <RequireAuth>
                    <CalendarPage />
                  </RequireAuth>
                } />
                {/* Favoritos removed */}
                <Route path="/conquistas" element={<GamificationPage />} />
                {/* Removed: Groups and Music routes */}
                
                {/* Handle @username redirects */}
                <Route path="/:raw" element={<HandleRedirect />} />
                
                {/* Error pages */}
                <Route path="/500" element={<ServerError />} />
                
                {/* Catch-all route MUST be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              </Suspense>
              <PWAInstallPrompt />
            </BrowserRouter>
          </ErrorBoundary>
        </AuthProvider>
        <Toaster />
        <Sonner />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;