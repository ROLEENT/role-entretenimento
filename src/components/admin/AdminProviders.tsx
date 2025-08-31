"use client";

import { SidebarProvider } from "@/components/ui/sidebar";

interface AdminProvidersProps {
  children: React.ReactNode;
}

export default function AdminProviders({ children }: AdminProvidersProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {children}
    </SidebarProvider>
  );
}