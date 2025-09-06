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
const ChecklistTest = lazy(() => import("./pages/ChecklistTest"));
const CurationTestPage = lazy(() => import("./pages/test/curation"));
const CurationDrawerTest = lazy(() => import("./pages/CurationDrawerTest"));
// Dashboard components
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

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

// Admin V3 Layout
import { AdminV3Layout } from "@/components/admin/AdminV3Layout";

// Admin V3 Pages
const AdminV3AgendaListNew = lazy(() => import("./pages/admin-v3/AdminV3AgendaListNew"));

const AdminV3AgendaEdit = lazy(() => import("./pages/admin-v3/AdminV3AgendaEdit"));
const AdminV3ArtistsList = lazy(() => import("./pages/admin-v3/AdminV3ArtistsList").then(module => ({ default: module.default })));
const AdminV3ArtistCreate = lazy(() => import("./pages/admin-v3/AdminV3ArtistCreate").then(module => ({ default: module.default })));
const AdminV3ArtistEdit = lazy(() => import("./pages/admin-v3/AdminV3ArtistEdit").then(module => ({ default: module.default })));

// Admin V3 Organizers Pages  
const AdminV3OrganizadoresList = lazy(() => import("./pages/admin-v3/AdminV3OrganizadoresList"));
const AdminV3OrganizerCreate = lazy(() => import("./pages/admin-v3/AdminV3OrganizerCreate"));
const AdminV3OrganizerEdit = lazy(() => import("./pages/admin-v3/AdminV3OrganizerEdit"));

// Admin V3 Venues Pages
const AdminV3VenuesList = lazy(() => import("./pages/admin-v3/AdminV3VenuesList"));
const AdminV3VenueCreate = lazy(() => import("./pages/admin-v3/AdminV3VenueCreate"));
const AdminV3VenueEdit = lazy(() => import("./pages/admin-v3/AdminV3VenueEdit"));

// Admin V3 Functional Pages
const AdminV3VenuesPage = lazy(() => import("./pages/admin-v3/AdminV3VenuesList"));
const AdminV3RevistaPage = lazy(() => import("./pages/admin-v3/AdminV3RevistaList"));
const AdminV3BlogCreate = lazy(() => import("./pages/admin-v3/AdminV3BlogCreate"));
const AdminV3BlogEdit = lazy(() => import("./pages/admin-v3/AdminV3BlogEdit"));
const AdminV3GestaoPage = lazy(() => import("./pages/admin-v3/gestao/index"));
const AdminV3DestaquesPage = lazy(() => import("./pages/admin-v3/AdminV3DestaquesList"));

// Admin V3 Gestao Pages
const AdminV3GestaoLogsPage = lazy(() => import("./pages/admin-v3/gestao/SystemLogsPage"));
const AdminV3GestaoNotificacoesPage = lazy(() => import("./pages/admin-v3/gestao/NotificationsPushPage"));
const AnalyticsPage = lazy(() => import("./pages/admin-v3/gestao/AnalyticsPage"));
const BackupRestorePage = lazy(() => import("./pages/admin-v3/gestao/BackupRestorePage"));
const SecurityPage = lazy(() => import("./pages/admin-v3/gestao/security"));


const OrganizerTerms = lazy(() => import("./pages/OrganizerTerms"));
const Help = lazy(() => import("./pages/Help"));
const Agenda = lazy(() => import("./pages/Agenda"));
const AgendaTodos = lazy(() => import("./pages/AgendaTodos"));
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
const AdminV3Login = lazy(() => import("./pages/admin-v3/login"));
const AdminV3Dashboard = lazy(() => import("./pages/AdminV3Dashboard"));
const AdminV3Debug = lazy(() => import("./pages/AdminV3Debug"));
// Eventos V3 - Nova Estrutura
const AdminV3EventsDashboard = lazy(() => import("./pages/admin-v3/AdminV3EventsDashboard"));
const AdminV3EventsCreateEdit = lazy(() => import("./pages/admin-v3/AdminV3EventsCreateEdit"));
const AdminV3EventCreate = lazy(() => import("./pages/admin-v3/AdminV3EventCreate"));

const AdminV3EventEdit = lazy(() => import("./pages/admin-v3/AdminV3EventEdit"));
const DevAuth = lazy(() => import("./pages/DevAuth"));

// Under Construction Components
const UnderConstructionPage = lazy(() => import("@/components/admin/UnderConstructionPage").then(module => ({ default: module.UnderConstructionPage })));
const UnderConstructionHandler = lazy(() => import("@/components/admin/UnderConstructionHandler").then(module => ({ default: module.UnderConstructionHandler })));

// Admin Blog components
const AdminBlogList = lazy(() => import("./components/admin/blog/AdminBlogList").then(module => ({ default: module.AdminBlogList })));

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
const EventDetailPageV2 = lazy(() => import("./pages/EventDetailPageV2"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PublicAuthPage = lazy(() => import("./pages/PublicAuthPage"));
const ClaimProfilePage = lazy(() => import("./pages/ClaimProfilePage"));
const Profile = lazy(() => import("./pages/Profile"));
const WeeklyHighlights = lazy(() => import("./pages/WeeklyHighlights"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const DiscoverUsers = lazy(() => import("./pages/DiscoverUsers"));
const CreateProfileComingSoon = lazy(() => import("./pages/CreateProfileComingSoon"));
const FavoritosPage = lazy(() => import("./pages/FavoritosPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ScrollToTop = lazy(() => import("./components/ScrollToTop"));
const DebugCombo = lazy(() => import("./pages/DebugCombo"));
const TestPage = lazy(() => import("./pages/TestPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const Fase5DemoPage = lazy(() => import("./pages/Fase5DemoPage"));

// Profiles pages
const DirectoryPage = lazy(() => import("./pages/profiles/DirectoryPage"));
const ProfilePage = lazy(() => import("./pages/profiles/ProfilePage"));
const CityDirectoryPage = lazy(() => import("./pages/profiles/CityDirectoryPage"));

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
                {/* Root redirect */}
                <Route path="/" element={<Index />} />
                
                {/* Demo page route */}
                <Route path="/fase5-demo" element={<Fase5DemoPage />} />
                
                {/* Static Pages */}
                <Route path="/sobre" element={<About />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
                <Route path="/politica-spam" element={<SpamPolicy />} />
                <Route path="/termos-usuario" element={<UserTerms />} />
                <Route path="/termos-organizador" element={<OrganizerTerms />} />
                <Route path="/ajuda" element={<Help />} />
                
                {/* Institutional Pages */}
                <Route path="/institucional" element={<InstitucionalIndex />} />
                <Route path="/institucional/parcerias" element={<Parcerias />} />
                <Route path="/institucional/trabalhe-conosco" element={<TrabalheConosco />} />
                <Route path="/institucional/imprensa" element={<Imprensa />} />
                
                {/* Agenda Routes - Order matters for routing */}
                <Route path="/agenda" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><Agenda /></AgendaLayout></Suspense>} />
                <Route path="/agenda/todos" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><AgendaTodos /></AgendaLayout></Suspense>} />
                <Route path="/agenda/outras-cidades" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><OutrasCidades /></AgendaLayout></Suspense>} />
                <Route path="/agenda/cidade/:cidade" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><AgendaCidade /></AgendaLayout></Suspense>} />
                <Route path="/agenda/:slug" element={<Suspense fallback={<PageLoadingFallback />}><AgendaLayout><AgendaDetailPage /></AgendaLayout></Suspense>} />
                
                {/* Preview Routes */}
                <Route path="/preview/agenda/:slug" element={<PreviewAgenda />} />
                
                {/* Test Routes */}
                <Route path="/test/checklist" element={<ChecklistTest />} />
                <Route path="/test/curation" element={<CurationTestPage />} />
                <Route path="/test/drawer" element={<CurationDrawerTest />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/debug/combo" element={<DebugCombo />} />
                {/* Removed old test route */}
                
                {/* Revista Routes */}
                <Route path="/revista" element={<Suspense fallback={<PageLoadingFallback />}><RevistaPage /></Suspense>} />
                <Route path="/revista/:slug" element={<Suspense fallback={<PageLoadingFallback />}><RevistaArticlePage /></Suspense>} />
                
                {/* Profiles Routes */}
                <Route path="/perfis" element={<Suspense fallback={<PageLoadingFallback />}><DirectoryPage /></Suspense>} />
                <Route path="/perfil/:handle" element={<Suspense fallback={<PageLoadingFallback />}><ProfilePage /></Suspense>} />
                <Route path="/perfil/@:handle" element={<Suspense fallback={<PageLoadingFallback />}><ProfilePage /></Suspense>} />
                <Route path="/claim/:handle" element={<Suspense fallback={<PageLoadingFallback />}><ClaimProfilePage /></Suspense>} />
                <Route path="/cidades/:slug/perfis" element={<Suspense fallback={<PageLoadingFallback />}><CityDirectoryPage /></Suspense>} />
                
                {/* Profile Creation Routes - Coming Soon */}
                <Route path="/criar/perfil" element={<Suspense fallback={<PageLoadingFallback />}><CreateProfileComingSoon /></Suspense>} />
                
                {/* Highlights Routes */}
                <Route path="/highlights" element={<HighlightsPage />} />
                <Route path="/cidade/:cidade" element={<CityHighlights />} />
                
            {/* New Dashboard Route */}
            <Route path="/dashboard" element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <DashboardPage />
              </Suspense>
            } />

            {/* Admin Panel Routes (legacy) */}
            <Route path="/admin-legacy" element={<AdminLayout />}>
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
                
                {/* Admin V3 System - Login standalone */}
                <Route path="/admin-v3/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Login /></Suspense>} />
                <Route path="/dev-auth" element={<Suspense fallback={<AdminLoadingFallback />}><DevAuth /></Suspense>} />
                
                {/* Admin V3 - All routes with unified layout */}
                <Route path="/admin-v3" element={<AdminV3Layout />}>
                  <Route index element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Dashboard /></Suspense>} />
                  <Route path="dashboard" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Dashboard /></Suspense>} />
                  <Route path="debug" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3Debug /></Suspense>} />
                  
                   {/* Agenda Routes */}
                   <Route path="agenda" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3AgendaListNew /></Suspense>} />
                   <Route path="agenda/criar" element={<Navigate to="/admin-v3/eventos/criar?from=agenda" replace />} />
                  <Route path="agenda/:id/editar" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3AgendaEdit /></Suspense>} />
                  <Route path="agenda/rascunhos" element={<Suspense fallback={<AdminLoadingFallback />}><UnderConstructionPage title="Rascunhos da Agenda" description="Funcionalidade em desenvolvimento" expectedFeatures={['Salvar eventos como rascunho', 'Revisar antes de publicar', 'Agendamento de publicação']} breadcrumbItems={[{label: 'Agenda', path: '/admin-v3/agenda'}, {label: 'Rascunhos'}]} /></Suspense>} />
                  <Route path="agenda/configuracoes" element={<Suspense fallback={<AdminLoadingFallback />}><UnderConstructionPage title="Configurações da Agenda" description="Funcionalidade em desenvolvimento" expectedFeatures={['Configurações gerais', 'Integração com APIs', 'Notificações automáticas']} breadcrumbItems={[{label: 'Agenda', path: '/admin-v3/agenda'}, {label: 'Configurações'}]} /></Suspense>} />
                  
                  {/* Eventos Routes - Nova Estrutura */}
                  <Route path="eventos" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3EventsDashboard /></Suspense>} />
                  <Route path="eventos/criar" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3EventCreate /></Suspense>} />
                  <Route path="eventos/:id/editar" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3EventsCreateEdit /></Suspense>} />
                  
                  {/* Legacy Routes - Redirecionamentos */}
                  <Route path="agenda/eventos" element={<Navigate to="/admin-v3/eventos" replace />} />
                  <Route path="agenda/eventos/criar" element={<Navigate to="/admin-v3/eventos/criar" replace />} />
                  <Route path="agenda/eventos/:id/editar" element={<Navigate to="/admin-v3/eventos/$1/editar" replace />} />
                  
                  {/* Agentes Routes */}
                  <Route path="agentes/artistas" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3ArtistsList /></Suspense>} />
                  <Route path="agentes/artistas/criar" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3ArtistCreate /></Suspense>} />
                  <Route path="agentes/artistas/create" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3ArtistCreate /></Suspense>} />
                  <Route path="agentes/artistas/:id/edit" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3ArtistEdit /></Suspense>} />
                  <Route path="agentes/venues" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3VenuesList /></Suspense>} />
                  <Route path="agentes/venues/create" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3VenueCreate /></Suspense>} />
                  <Route path="agentes/venues/:id/edit" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3VenueEdit /></Suspense>} />
                  <Route path="agentes/organizadores" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3OrganizadoresList /></Suspense>} />
                  <Route path="agentes/organizadores/create" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3OrganizerCreate /></Suspense>} />
                  <Route path="agentes/organizadores/:id/edit" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3OrganizerEdit /></Suspense>} />
                  
                  
                  {/* Other modules */}
                  <Route path="revista" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3RevistaPage /></Suspense>} />
                  <Route path="revista/create" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3BlogCreate /></Suspense>} />
                  <Route path="revista/:id/edit" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3BlogEdit /></Suspense>} />
                  
                  {/* Gestao Routes */}
                  <Route path="gestao" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3GestaoPage /></Suspense>} />
                  <Route path="gestao/logs" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3GestaoLogsPage /></Suspense>} />
                  <Route path="gestao/notificacoes" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3GestaoNotificacoesPage /></Suspense>} />
                  <Route path="gestao/analytics" element={<Suspense fallback={<AdminLoadingFallback />}><AnalyticsPage /></Suspense>} />
                  <Route path="gestao/backup" element={<Suspense fallback={<AdminLoadingFallback />}><BackupRestorePage /></Suspense>} />
                  <Route path="gestao/security" element={<Suspense fallback={<AdminLoadingFallback />}><SecurityPage /></Suspense>} />
                  <Route path="destaques" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3DestaquesPage /></Suspense>} />
                  <Route path="destaques/*" element={<Suspense fallback={<AdminLoadingFallback />}><AdminV3DestaquesPage /></Suspense>} />
                  
                  {/* Fallback for under construction */}
                  <Route path="under-construction" element={<Suspense fallback={<AdminLoadingFallback />}><UnderConstructionHandler /></Suspense>} />
                </Route>
                
                {/* Events Routes - /eventos permanently removed as requested */}
                {/* Redirect old /eventos routes to /agenda */}
                <Route path="/eventos" element={<Navigate to="/agenda" replace />} />
                <Route path="/eventos/*" element={<Navigate to="/agenda" replace />} />
                <Route path="/evento/:slug" element={<EventDetailPageV2 />} />
                <Route path="/criar-evento" element={<CreateEventPage />} />
                
                {/* User Routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/criar-perfil" element={<CreateProfileComingSoon />} />
                <Route path="/meus-perfis" element={
                  <RequireAuth>
                    <Suspense fallback={<PageLoadingFallback />}>
                      {React.createElement(lazy(() => import('./pages/UserDashboard')))}
                    </Suspense>
                  </RequireAuth>
                } />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/descobrir" element={<DiscoverUsers />} />
                <Route path="/eventos/semana/:data" element={<WeeklyHighlights />} />
                <Route path="/meu-calendario" element={
                  <RequireAuth>
                    <CalendarPage />
                  </RequireAuth>
                } />
                <Route path="/favoritos" element={
                  <RequireAuth>
                    <FavoritosPage />
                  </RequireAuth>
                } />
                <Route path="/conquistas" element={<GamificationPage />} />
                {/* Removed: Groups and Music routes */}
                
                {/* Handle @username redirects */}
                <Route path="/:raw" element={<HandleRedirect />} />
                
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