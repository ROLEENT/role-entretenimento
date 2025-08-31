import Index from '@/pages/Index';

export function DashboardRedirect() {
  // Always show the homepage without any authentication checks
  return <Index />;
}