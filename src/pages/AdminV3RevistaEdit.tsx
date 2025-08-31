import React from 'react';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import PostEditPage from '@/pages/PostEditPage';

export default function AdminV3RevistaEdit() {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-4xl mx-auto">
            <AdminV3Breadcrumb 
              items={[
                { label: 'Dashboard', path: '/admin-v3' },
                { label: 'Revista', path: '/admin-v3/revista' },
                { label: 'Editar' }
              ]} 
            />
            <PostEditPage />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}