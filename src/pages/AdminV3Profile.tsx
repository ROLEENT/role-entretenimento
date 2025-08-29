import React from 'react';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminV3Profile() {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Página de perfil em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}