import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};