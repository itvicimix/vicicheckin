"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  MessageSquare, 
  Database,
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Tenants (Salons)", href: "/super-admin", icon: Building2 },
    { name: "SMS & API Config", href: "/super-admin/sms", icon: MessageSquare },
    { name: "Global Settings", href: "/super-admin/settings", icon: Settings },
    { name: "Database Backups", href: "/super-admin/backups", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-100">
      {/* Sidebar - Dark theme for Super Admin to distinguish from normal admin */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
            <ShieldCheck size={20} />
          </div>
          <span className="font-bold text-white text-lg">Super Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-600/20 text-blue-400" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                }`}
              >
                <Icon size={20} className={isActive ? "text-blue-400" : "text-gray-500"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors font-medium">
            <LogOut size={20} />
            Logout System
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="font-semibold text-gray-100 hidden sm:block">IT Operations Dashboard</h1>
          
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-400">System Status: <span className="text-green-400 font-medium">All Green</span></span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              IT
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
