"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Mail, Key, UserCircle, CheckCircle2, Save, ToggleRight, ToggleLeft, LogOut, Laptop, Activity } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SuperAdminProfilePage() {
  const [newPassword, setNewPassword] = useState("");
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [browserInfo, setBrowserInfo] = useState("");
  
  useEffect(() => {
    const customPw = localStorage.getItem("super_admin_custom_password");
    if (customPw) {
      setNewPassword(customPw);
    } else {
      setNewPassword("Mix12:33#");
    }
    
    const is2fa = localStorage.getItem("super_admin_2fa_enabled") === "true";
    setIs2faEnabled(is2fa);

    setBrowserInfo(navigator.userAgent);
  }, []);

  const handleSavePassword = () => {
    if (newPassword.trim().length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    localStorage.setItem("super_admin_custom_password", newPassword);
    toast.success("Password updated successfully!");
  };

  const handleToggle2fa = () => {
    const newState = !is2faEnabled;
    setIs2faEnabled(newState);
    localStorage.setItem("super_admin_2fa_enabled", newState.toString());
    if (newState) {
      toast.success("2FA Enabled! You will need Google Authenticator on next login.");
    } else {
      toast.success("2FA Disabled.");
    }
  };

  const handleLogoutAll = () => {
    localStorage.removeItem("super_admin_auth");
    toast.success("Logged out of all devices. Redirecting...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">View your IT Operations administrative privileges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
              <UserCircle size={48} />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">IT Operations</h2>
            <p className="text-blue-400 font-medium text-sm mb-4">Super Administrator</p>
            
            <div className="w-full bg-green-500/10 text-green-400 p-3 rounded-lg flex items-center justify-center gap-2 border border-green-500/20">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium">System Access: Active</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-4">
              <ShieldCheck className="text-blue-400" size={20} />
              Account Details
            </h3>
            
            <div className="space-y-4 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-0.5">Email Address</p>
                    <p className="text-white font-medium">it@nailbook247.com</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0">
                  <span className="px-2.5 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-600">Hardcoded</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <Key size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-0.5">Password</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 w-full max-w-[200px]"
                      />
                      <button 
                        onClick={handleSavePassword}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors text-sm font-medium"
                      >
                        <Save size={16} />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-0.5">Two-Factor Authentication (2FA)</p>
                    <p className={is2faEnabled ? "text-green-400 font-medium text-sm" : "text-yellow-400 font-medium text-sm"}>
                      {is2faEnabled ? "Enabled (Require OTP)" : "Disabled (Local Mode)"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0">
                  <button 
                    onClick={handleToggle2fa}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      is2faEnabled 
                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                        : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    }`}
                  >
                    {is2faEnabled ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
                    {is2faEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </button>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-4">
              <Laptop className="text-blue-400" size={20} />
              Session & Devices
            </h3>
            
            <div className="space-y-4 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <Laptop size={18} />
                  </div>
                  <div className="max-w-[250px] sm:max-w-md">
                    <p className="text-sm text-white mb-0.5 font-medium truncate" title={browserInfo}>{browserInfo || "Current Browser"}</p>
                    <p className="text-green-400 text-xs">Active Session • Localhost</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0">
                  <button 
                    onClick={handleLogoutAll}
                    className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded transition-colors text-sm font-medium border border-red-500/20"
                  >
                    <LogOut size={16} />
                    Logout All Devices
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-4">
              <Activity className="text-blue-400" size={20} />
              Recent Activity Logs
            </h3>
            
            <div className="space-y-0 mt-4">
              {[
                { action: "Accessed Database Backups", time: "Just now" },
                { action: "Disabled 2FA Authentication", time: "10 minutes ago" },
                { action: "Logged in via Email/Password", time: "1 hour ago" },
                { action: "Checked System Status", time: "Yesterday" }
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-300">{log.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
