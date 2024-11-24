// components/Layout.tsx
import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils"; // Util untuk conditional classNames dari shadcn

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarMenu = () => {
  const { toggleSidebar } = useSidebar();

  const menuItems = [
    { name: "Profile", href: "/profile" },
    { name: "Account", href: "/account" },
    { name: "Appearance", href: "/appearance" },
    { name: "Notifications", href: "/notifications" },
    { name: "Display", href: "/display" },
  ];

  return (
    <div className="h-screen bg-gray-100 border-r">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold">Settings</h2>
        <button
          onClick={toggleSidebar}
          className="text-sm text-blue-500 hover:underline"
        >
          Toggle
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              className={cn(
                "block px-4 py-2 hover:bg-blue-100 rounded-md text-gray-800"
              )}
            >
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      {isOpen && (
        <aside className="w-1/4 bg-white shadow-md">
          <SidebarMenu />
        </aside>
      )}

      {/* Main Content */}
      <main
        className={cn("flex-1 p-6 transition-all", {
          "ml-0": isOpen,
          "ml-[-100%]": !isOpen,
        })}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
