import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();
  
  // Don't apply scroll to top on revista page to avoid conflicts with cache
  const shouldScrollToTop = !location.pathname.startsWith('/revista');
  
  // Use the custom hook for scroll restoration
  useScrollToTop(shouldScrollToTop);
  
  return null;
};

export default ScrollToTop;