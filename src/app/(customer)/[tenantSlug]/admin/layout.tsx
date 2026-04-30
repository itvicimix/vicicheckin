"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Sparkles, 
  Settings, 
  LogOut,
  Bell,
  User,
  Loader2,
  ListTodo,
  Menu,
  X,
  Tag,
  Sun,
  Moon,
  Clock
} from "lucide-react";
import { logoutAdmin } from "@/actions/auth";
import { getTenantBySlug } from "@/actions/tenant";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notification";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tenantSlug } = useParams() as { tenantSlug: string };
  
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("adminTheme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("adminTheme", newTheme ? "dark" : "light");
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchTenantData = async () => {
      try {
        const t = await getTenantBySlug(tenantSlug);
        setTenant(t);
        if (t) {
          const notifs = await getNotifications(t.id);
          setNotifications(notifs);
        }
      } catch (error) {
        console.error("Error fetching tenant info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchTenantData();

    // Poll every 15 seconds
    intervalId = setInterval(async () => {
      if (tenant?.id) {
        const notifs = await getNotifications(tenant.id);
        setNotifications(notifs);
      } else {
        fetchTenantData();
      }
    }, 15000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [tenantSlug, tenant?.id]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      await markAsRead(notif.id);
    }
    
    if (notif.type === "appointment") {
      setShowNotifications(false);
      router.push(`/${tenantSlug}/admin/appointments`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!tenant || unreadCount === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllAsRead(tenant.id);
  };

  const handleLogout = async () => {
    await logoutAdmin(tenantSlug);
    router.push(`/${tenantSlug}/login`);
  };

  const navigation = [
    { name: "Dashboard", href: `/${tenantSlug}/admin`, icon: LayoutDashboard },
    { name: "Calendar", href: `/${tenantSlug}/admin/calendar`, icon: CalendarDays },
    { name: "Appointments", href: `/${tenantSlug}/admin/appointments`, icon: ListTodo },
    { name: "Customers", href: `/${tenantSlug}/admin/customers`, icon: User },
    { name: "Services", href: `/${tenantSlug}/admin/services`, icon: Sparkles },
     { name: "Staff", href: `/${tenantSlug}/admin/staff`, icon: Users },
     { name: "Promotions", href: `/${tenantSlug}/admin/promotions`, icon: Tag },
     { name: "Working Hours", href: `/${tenantSlug}/admin/working-hours`, icon: Clock },
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
      className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? "dark bg-zinc-950 text-white" : "bg-gray-50 text-gray-900"}`}
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
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-all duration-300 transform border-r
        ${isDarkMode ? "bg-black border-zinc-800" : "bg-white border-gray-200"}
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:h-screen
      `}>
        <div className={`py-5 flex items-center px-6 border-b justify-between ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}>
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

        <div className={`p-4 border-t ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}>
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
        <header className={`h-16 border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 transition-colors duration-300 ${isDarkMode ? "bg-black border-zinc-800" : "bg-white border-gray-200"}`}>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`p-2 -ml-2 md:hidden rounded-lg transition-colors ${isDarkMode ? "text-zinc-400 hover:bg-zinc-900" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Menu size={24} />
          </button>

          <h1 className={`font-semibold hidden md:block truncate ml-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>Welcome, {tenant?.name || "Admin"}!</h1>
          <h1 className={`font-semibold md:hidden truncate ml-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>Dashboard</h1>
          
          <div className="flex items-center gap-2 md:gap-4 ml-auto relative">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${
                isDarkMode 
                  ? "bg-zinc-800 text-yellow-400 hover:bg-zinc-700" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 relative rounded-full transition-colors focus:outline-none ${
                  isDarkMode ? "text-zinc-400 hover:bg-zinc-900" : "text-gray-400 hover:bg-gray-100"
                }`}
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
                  <div className={`absolute top-full right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${
                    isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"
                  }`}>
                    <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-gray-50/50 border-gray-50"}`}>
                      <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:underline font-medium">Mark all as read</button>
                      )}
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? (isDarkMode ? 'bg-primary/10' : 'bg-blue-50/30') : ''} ${isDarkMode ? 'border-zinc-800 hover:bg-zinc-800' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                notif.type === 'appointment' ? 'bg-green-100 text-green-700' :
                                notif.type === 'update' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {notif.type === 'appointment' ? 'Appointment' : notif.type === 'update' ? 'Update' : 'Maintenance'}
                              </span>
                              <span className="text-xs text-gray-400 font-medium">{formatTimeAgo(notif.createdAt)}</span>
                            </div>
                            <h4 className={`text-sm font-semibold mt-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>{notif.title}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                          </div>
                        ))
                      )}
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
