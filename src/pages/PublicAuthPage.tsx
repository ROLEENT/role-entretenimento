import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { usePublicAuth } from '@/hooks/usePublicAuth';
import { PublicAuthDialog } from '@/components/auth/PublicAuthDialog';

export default function PublicAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = usePublicAuth();
  
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleClose = () => {
    navigate(from, { replace: true });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <PublicAuthDialog
      open={true}
      onOpenChange={handleClose}
      defaultTab="signin"
    />
  );
}