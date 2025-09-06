import React from 'react';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  actions?: React.ReactNode;
  headerExtra?: React.ReactNode;
  className?: string;
}

export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({
  children,
  title,
  description,
  actions,
  headerExtra,
  className = ""
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || actions || headerExtra) && (
        <div className="flex items-center justify-between">
          {title && (
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          <div className="flex items-center gap-4">
            {headerExtra}
            {actions && (
              <div className="flex gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};