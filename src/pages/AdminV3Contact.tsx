import React from 'react';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { ContactPage } from '@/pages/admin/ContactPage';

export default function AdminV3Contact() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin-v3' },
    { label: 'Contatos', href: '/admin-v3/contatos' }
  ];

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="container mx-auto py-6">
          <AdminV3Breadcrumb items={breadcrumbItems} />
          <div className="mt-6">
            <ContactPage />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}