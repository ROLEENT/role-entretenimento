import { useScrollToTop } from '@/hooks/useScrollToTop';

const ScrollToTop = () => {
  // Use the custom hook for scroll restoration
  useScrollToTop();
  
  return null;
};

export default ScrollToTop;