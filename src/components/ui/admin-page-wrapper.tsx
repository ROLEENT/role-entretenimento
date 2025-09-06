import React from 'react';
import { AdminV3Guard } from '@/components/AdminV3Guard';

import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import ErrorBoundary from '@/components/ErrorBoundary';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  headerExtra?: React.ReactNode;
  className?: string;
}

export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({
  children,
  title,
  description,
  breadcrumbs = [],
  actions,
  headerExtra,
  className = ""
}) => {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        
        <div className={`pt-16 p-6 ${className}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            {breadcrumbs.length > 0 && (
              <AdminV3Breadcrumb items={breadcrumbs} />
            )}
            
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
            
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
};