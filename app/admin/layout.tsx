// Tambahkan "use client" di bagian atas file ini
"use client"; 

import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useDynamicNavigation } from "@/data/usersNavigation"; // Mengimpor hook dinamis
import { AppSidebar } from "@/components/app-sidebar"; // Komponen Sidebar

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  const navigationData = useDynamicNavigation(); // Ambil navigasi dinamis
  
  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar navigationData={navigationData} className="w-64" />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
