import React from 'react';
import { sanitizeHTML, createSafeHTML } from '@/utils/sanitize';

interface SafeHTMLProps {
  content: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * SafeHTML component that sanitizes HTML content before rendering
 * Use this instead of dangerouslySetInnerHTML for user-generated content
 */
export const SafeHTML: React.FC<SafeHTMLProps> = ({ 
  content, 
  className, 
  as: Component = 'div' 
}) => {
  const sanitizedContent = createSafeHTML(content);
  
  return (
    <Component 
      className={className}
      dangerouslySetInnerHTML={sanitizedContent}
    />
  );
};

export default SafeHTML;