import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface AgendaLayoutProps {
  children: ReactNode;
}

export function AgendaLayout({ children }: AgendaLayoutProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

export default AgendaLayout;