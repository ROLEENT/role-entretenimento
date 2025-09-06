import React from 'react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AdminV3BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function AdminV3Breadcrumb({ items }: AdminV3BreadcrumbProps) {
  // This component is deprecated - breadcrumbs are now handled by AdminV3LayoutHeader
  // This is just a stub to prevent build errors
  return null;
}