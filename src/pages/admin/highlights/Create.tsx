// This is just a redirect to the main highlight editor
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminHighlightCreate() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/highlights/create', { replace: true });
  }, [navigate]);

  return null;
}