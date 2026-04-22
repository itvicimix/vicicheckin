"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Scissors, 
  Settings, 
  LogOut,
  Bell,
  User,
  Loader2
} from "lucide-react";
import { logoutAdmin } from "@/actions/auth";
import { getTenantBySlug } from "@/actions/tenant";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tenantSlug } = useParams() as { tenantSlug: string };
  
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const t = await getTenantBySlug(tenantSlug);
        setTenant(t);
      } catch (error) {
        console.error("Error fetching tenant info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTenant();
  }, [tenantSlug]);

  const handleLogout = async () => {
    await logoutAdmin(tenantSlug);
    router.push(`/${tenantSlug}/login`);
  };

  const navigation = [
    { name: "Dashboard", href: `/${tenantSlug}/admin`, icon: LayoutDashboard },
    { name: "Calendar", href: `/${tenantSlug}/admin/calendar`, icon: CalendarDays },
    { name: "Customers", href: `/${tenantSlug}/admin/customers`, icon: User },
    { name: "Services", href: `/${tenantSlug}/admin/services`, icon: Scissors },
    { name: "Staff", href: `/${tenantSlug}/admin/staff`, icon: Users },
    { name: "Settings", href: `/${tenantSlug}/admin/settings`, icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="py-5 flex items-center px-6 border-b border-gray-200">
          <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mr-3 shrink-0">
            {tenant?.name?.charAt(0) || "L"}
          </div>
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="font-bold text-slate-800 text-[17px] leading-tight truncate">{tenant?.name || "Loading..."}</span>
            <span className="text-slate-500 text-[13px] mt-0.5 leading-tight truncate">{tenant?.location || "Dashboard"}</span>
          </div>
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
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="font-semibold text-gray-800 hidden sm:block">Welcome, {tenant?.name || "Admin"}!</h1>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 relative text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-1 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium uppercase">
              {tenant?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
