"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { verifySuperAdminOtp } from "@/actions/adminAuth";
import { verifySubAdminLogin } from "@/actions/superAdminUser";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  MessageSquare, 
  Database,
  Settings, 
  LogOut,
  ShieldCheck,
  UserCircle,
  Users
} from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUserEmail, setLoggedUserEmail] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("super_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      setLoggedUserEmail("it@nailbook247.com");
    } else if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.email) {
          setIsAuthenticated(true);
          setLoggedUserEmail(parsed.email);
        }
      } catch (e) {}
    }
    setIsChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const customPw = localStorage.getItem("super_admin_custom_password") || "Mix12:33#";
      if (email === "it@nailbook247.com" && password === customPw) {
        const is2fa = localStorage.getItem("super_admin_2fa_enabled") === "true";
        if (is2fa) {
          setStep(2);
          setError("");
        } else {
          localStorage.setItem("super_admin_auth", JSON.stringify({ email: "it@nailbook247.com", role: "root" }));
          setLoggedUserEmail("it@nailbook247.com");
          setIsAuthenticated(true);
          setError("");
        }
      } else {
        const isValidSubAdmin = await verifySubAdminLogin(email, password);
        if (isValidSubAdmin) {
           localStorage.setItem("super_admin_auth", JSON.stringify({ email, role: "subadmin" }));
           setLoggedUserEmail(email);
           setIsAuthenticated(true);
           setError("");
        } else {
           setError("Invalid email or password");
        }
      }
    } else if (step === 2) {
      const isValid = await verifySuperAdminOtp(otpCode);
      if (isValid) {
        localStorage.setItem("super_admin_auth", JSON.stringify({ email: "it@nailbook247.com", role: "root" }));
        setLoggedUserEmail("it@nailbook247.com");
        setIsAuthenticated(true);
        setError("");
      } else {
        setError("Invalid Authenticator Code");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("super_admin_auth");
    setIsAuthenticated(false);
  };

  if (isChecking) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 animate-in fade-in zoom-in">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">Nail Book 24/7 Super Admin</h2>
          <p className="text-gray-400 text-center text-sm mb-6">Enter your credentials to access Nail Book 24/7 Operations.</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="it@nailbook247.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors mt-2"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <div className="mb-2 text-sm text-gray-400 text-center">
                  Please enter the 6-digit code from Google Authenticator.
                </div>
                <div>
                  <input 
                    type="text" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-center text-2xl tracking-widest focus:border-blue-500 outline-none transition-colors"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors mt-2"
                >
                  Verify & Sign In
                </button>
                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowQr(!showQr)} 
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showQr ? "Hide QR Code" : "First time setup? Show QR Code"}
                  </button>
                </div>
                {showQr && (
                  <div className="mt-4 p-4 bg-white rounded-xl flex flex-col items-center justify-center animate-in fade-in">
                    <QRCodeSVG value="otpauth://totp/NailBook247%20Super%20Admin:it@nailbook247.com?secret=KVKFKRCPNZQUYMLXOVYDSROQGEZCOQZX&issuer=Nail%20Book%2024/7" size={160} />
                    <p className="text-xs text-gray-600 mt-3 text-center">Scan this with Google Authenticator or Authy app.</p>
                  </div>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: "Business Names (Salons)", href: "/super-admin", icon: Building2 },
    { name: "SMS & API Config", href: "/super-admin/sms", icon: MessageSquare },
    { name: "Global Settings", href: "/super-admin/settings", icon: Settings },
    { name: "Database Backups", href: "/super-admin/backups", icon: Database },
    ...(loggedUserEmail === "it@vicimix.com" ? [{ name: "Admin Users", href: "/super-admin/users", icon: Users }] : []),
    { name: "My Profile", href: "/super-admin/profile", icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-100">
      <Toaster position="top-right" />
      {/* Sidebar - Dark theme for Super Admin to distinguish from normal admin */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
            <ShieldCheck size={20} />
          </div>
          <span className="font-bold text-white text-lg">Nail Book 24/7</span>
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
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors font-medium">
            <LogOut size={20} />
            Logout System
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="font-semibold text-gray-100 hidden sm:block">Nail Book 24/7 Operations</h1>
          
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-400">System Status: <span className="text-green-400 font-medium">All Green</span></span>
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs text-gray-500">{loggedUserEmail}</span>
            </div>
            <Link href="/super-admin/profile" className="w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all ring-2 ring-transparent hover:ring-blue-400 cursor-pointer">
              {loggedUserEmail === "it@nailbook247.com" ? "NB" : loggedUserEmail.substring(0, 2).toUpperCase()}
            </Link>
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
