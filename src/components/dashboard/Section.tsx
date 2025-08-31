import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
}

export function Section({ 
  title, 
  description, 
  children, 
  className,
  headingLevel = 'h2'
}: SectionProps) {
  const HeadingTag = headingLevel;

  return (
    <section className={cn("dashboard-section", className)} aria-labelledby={title ? `section-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}>
      {(title || description) && (
        <div className="dashboard-section-header">
          {title && (
            <HeadingTag 
              id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-lg font-semibold tracking-tight"
            >
              {title}
            </HeadingTag>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="dashboard-section-content">
        {children}
      </div>
    </section>
  );
}