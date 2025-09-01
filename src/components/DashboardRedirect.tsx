import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Index from '@/pages/Index';

export function DashboardRedirect() {
  // Always show the homepage immediately, without waiting for session
  return <Index />;
}