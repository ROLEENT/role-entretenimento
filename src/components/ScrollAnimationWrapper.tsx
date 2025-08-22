import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  className?: string;
}

const ScrollAnimationWrapper = ({ children, className = '' }: ScrollAnimationWrapperProps) => {
  const ref = useScrollAnimation();

  return (
    <div ref={ref} className={`animate-on-scroll ${className}`}>
      {children}
    </div>
  );
};

export default ScrollAnimationWrapper;