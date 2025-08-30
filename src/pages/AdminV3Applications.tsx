import React from 'react';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { ApplicationsPage } from '@/pages/admin/ApplicationsPage';

export default function AdminV3Applications() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin-v3' },
    { label: 'Candidaturas', href: '/admin-v3/candidaturas' }
  ];

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="container mx-auto py-6">
          <AdminV3Breadcrumb items={breadcrumbItems} />
          <div className="mt-6">
            <ApplicationsPage />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}