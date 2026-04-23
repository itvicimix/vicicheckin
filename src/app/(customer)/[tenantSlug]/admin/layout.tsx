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
  Loader2,
  ListTodo,
  Menu,
  X
} from "lucide-react";
import { logoutAdmin } from "@/actions/auth";
import { getTenantBySlug } from "@/actions/tenant";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tenantSlug } = useParams() as { tenantSlug: string };
  
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifications = [
    { id: 1, type: "appointment", title: "New Appointment", message: "A new customer just booked an appointment.", time: "Few minutes ago", read: false },
    { id: 2, type: "update", title: "App Update", message: "SMS Marketing feature is now available.", time: "2 hours ago", read: true },
    { id: 3, type: "maintenance", title: "System Maintenance", message: "System will undergo scheduled maintenance from 2 AM to 4 AM tomorrow.", time: "1 day ago", read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

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
    { name: "Appointments", href: `/${tenantSlug}/admin/appointments`, icon: ListTodo },
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
    <div 
      className="min-h-screen bg-gray-50 flex"
      style={tenant?.themeColor ? { '--color-primary': tenant.themeColor } as React.CSSProperties : undefined}
    >
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:h-screen
      `}>
        <div className="py-5 flex items-center px-6 border-b border-gray-200 justify-between">
          <div className="flex items-center overflow-hidden">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xl mr-3 shrink-0 overflow-hidden border-2 border-primary/20 ${!tenant?.logo ? 'bg-primary text-white' : 'bg-white'}`}>
              {tenant?.logo ? (
                <img src={tenant.logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
              ) : (
                tenant?.name?.charAt(0) || "L"
              )}
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
              <span className="font-bold text-slate-800 text-[17px] leading-tight truncate">{tenant?.name || "Loading..."}</span>
              <span className="text-slate-500 text-[13px] mt-0.5 leading-tight truncate">{tenant?.location || "Dashboard"}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 md:hidden hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
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
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-500 md:hidden hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <h1 className="font-semibold text-gray-800 hidden md:block truncate ml-2">Welcome, {tenant?.name || "Admin"}!</h1>
          <h1 className="font-semibold text-gray-800 md:hidden truncate ml-2">Dashboard</h1>
          
          <div className="flex items-center gap-4 ml-auto relative">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 relative text-gray-400 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-1 rounded-full border border-white"></span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      <button className="text-xs text-primary hover:underline font-medium">Mark all as read</button>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              notif.type === 'appointment' ? 'bg-green-100 text-green-700' :
                              notif.type === 'update' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {notif.type === 'appointment' ? 'Appointment' : notif.type === 'update' ? 'Update' : 'Maintenance'}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-800 mt-2">{notif.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-gray-50 bg-gray-50/50">
                      <button className="text-sm text-primary hover:underline font-medium">View all notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium uppercase shrink-0 overflow-hidden ring-2 ring-primary/20 ${!tenant?.logo ? 'bg-primary text-white' : 'bg-white'}`}>
              {tenant?.logo ? (
                <img src={tenant.logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
              ) : (
                tenant?.name?.charAt(0) || "A"
              )}
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
