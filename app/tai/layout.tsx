import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const navigationData = [
  {
    title: "Dashboard",
    items: [
      { title: "Users", url: "/admin/users" },
      { title: "Products", url: "/admin/products" },
      { title: "Orders", url: "/admin/orders" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SidebarProvider>
        <AppSidebar navigationData={navigationData} className="w-64" />
        {/* Main Content */}
        <main className="flex-1 ">{children}</main>
      </SidebarProvider>
    </div>
  );
}
