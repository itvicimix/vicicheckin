"use client";

import { useState, useEffect } from "react";
import { Database, Download, AlertTriangle, ShieldCheck, HardDrive, RefreshCw } from "lucide-react";
import { getDatabaseStats, exportFullDatabase } from "@/actions/database";

export default function DatabaseBackupsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      console.log("Calling getDatabaseStats...");
      const result = await getDatabaseStats();
      console.log("getDatabaseStats result:", result);
      if (result.success) {
        setStats(result.stats);
      } else {
        console.error("Action returned error:", result.error);
      }
    } catch (err) {
      console.error("Failed to call getDatabaseStats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportFullDatabase();
      if (result.success && result.data) {
        // Create blob and download
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", `database_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } else {
        alert("Export failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-100 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="text-blue-500" /> Database Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">Monitor system data and generate secure backups.</p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={isLoading}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /> 
          <span className="hidden sm:inline">Refresh Stats</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Status Card */}
        <div className="md:col-span-2 bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HardDrive size={20} className="text-purple-400" /> Connection Status
              </h3>
              <p className="text-gray-400 text-sm mt-1">MySQL Database is currently Active and accessible.</p>
            </div>
            <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Connected
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-gray-700 pt-6">
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Tenants</div>
              <div className="text-2xl font-bold text-white">{isLoading ? "-" : stats?.tenants || 0}</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Bookings</div>
              <div className="text-2xl font-bold text-white">{isLoading ? "-" : stats?.bookings || 0}</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Customers</div>
              <div className="text-2xl font-bold text-white">{isLoading ? "-" : stats?.customers || 0}</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Staff</div>
              <div className="text-2xl font-bold text-white">{isLoading ? "-" : stats?.staff || 0}</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Services</div>
              <div className="text-2xl font-bold text-white">{isLoading ? "-" : stats?.services || 0}</div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-gray-800 border border-blue-900/50 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <Download size={20} className="text-blue-400" /> Export Data
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Download a full snapshot of the entire database in JSON format. This file can be used for safe-keeping or migrations.
              </p>
              
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExporting ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                {isExporting ? "Generating JSON..." : "Download JSON Backup"}
              </button>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-red-400 flex items-center gap-2 mb-2">
              <AlertTriangle size={18} /> Direct SQL Access
            </h3>
            <p className="text-gray-400 text-sm">
              Direct SQL `.sql` dumps must be performed directly from the Hostinger Control Panel due to serverless execution limits.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
