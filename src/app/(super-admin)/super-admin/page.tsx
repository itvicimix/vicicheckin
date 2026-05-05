"use client";

import { useState, useEffect } from "react";
import { Plus, Link as LinkIcon, Edit2, ShieldAlert, X, Download, DollarSign, CalendarCheck, Users as UsersIcon, Scissors as ScissorsIcon, Save, Loader2, Tag } from "lucide-react";
import { getTenants, createTenant, runMaintenance, getTenantStats } from "@/actions/tenant";
import { getCoupons } from "@/actions/coupon";

export default function TenantsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showEditConfig, setShowEditConfig] = useState(false);
  
  // Real database state
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCount, setCouponCount] = useState(0);
  const [tenantStats, setTenantStats] = useState({ revenue: 0, bookingCount: 0, staffCount: 0, topServices: [] as any[] });
  const [errorMsg, setErrorMsg] = useState("");

  const generatePass = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars like I, O, 1, 0
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result + "!";
  };

  // Create form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    adminEmail: "",
    adminPassword: "TempPass123!",
    itPassword: generatePass(),
    themeColor: "#724677",
    location: "",
    phone: "",
    bookingPhone: ""
  });

  // Load tenants on mount
  const loadTenants = async () => {
    setIsLoading(true);
    const res = await getTenants();
    if (res.success && res.data) {
      setTenants(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await runMaintenance();
      await loadTenants();
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      getCoupons(selectedTenant.id).then(coupons => setCouponCount(coupons.length));
      getTenantStats(selectedTenant.id).then(res => {
        if (res.success && res.data) {
          setTenantStats(res.data);
        }
      });
    }
  }, [selectedTenant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    
    // Default payment method
    const selectedPayments = ["Pay in Store"];

    const result = await createTenant({
      ...formData,
      payments: selectedPayments
    });

    if (result.success) {
      setShowForm(false);
      setFormData({
        name: "", 
        slug: "", 
        adminEmail: "", 
        adminPassword: "TempPass123!", 
        itPassword: generatePass(),
        themeColor: "#724677", 
        location: "", 
        phone: "",
        bookingPhone: ""
      });
      loadTenants(); // Refresh list
    } else {
      setErrorMsg(result.error || "An error occurred");
    }
    setIsSubmitting(false);
  };

  const handleUpdateConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTenant) return;
    
    setIsSubmitting(true);
    const form = e.currentTarget;
    const updatedData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      adminEmail: (form.elements.namedItem("adminEmail") as HTMLInputElement).value,
      adminPassword: (form.elements.namedItem("adminPassword") as HTMLInputElement).value,
      itPassword: (form.elements.namedItem("itPassword") as HTMLInputElement).value,
      location: (form.elements.namedItem("location") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      bookingPhone: (form.elements.namedItem("bookingPhone") as HTMLInputElement).value,
      dueDate: (form.elements.namedItem("dueDate") as HTMLInputElement).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
      themeColor: selectedTenant.themeColor, // Keep existing if not changed in this simple form
    };

    const { updateTenantSettings } = await import("@/actions/tenant");
    const res = await updateTenantSettings(selectedTenant.id, updatedData);
    
    if (res.success) {
      setShowEditConfig(false);
      setSelectedTenant(res.data);
      loadTenants();
    } else {
      alert(res.error || "Failed to update configuration");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 text-gray-100">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Business Name Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage business names, generate booking links, and handle subscriptions.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} /> New Business Name
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">Create New Business Name</h3>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2">
              <ShieldAlert size={16} /> {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Business Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Star Nails" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">URL Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="e.g., star-nails" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Admin Email *</label>
              <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleInputChange} placeholder="owner@starnails.com" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Admin Password *</label>
              <input type="text" name="adminPassword" value={formData.adminPassword} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Theme Color (Hex)</label>
              <input type="text" name="themeColor" value={formData.themeColor} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Logo</label>
              <input type="file" accept="image/*" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 focus:border-blue-500 outline-none transition-colors cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., 123 Beauty Ave" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g., (555) 123-4567" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Booking Phone</label>
              <input type="text" name="bookingPhone" value={formData.bookingPhone} onChange={handleInputChange} placeholder="e.g., (555) 987-6543" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert size={14} /> IT System Account
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Username (Default)</label>
                  <input type="text" value="itvicimix" disabled className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-gray-500 text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                    Generated IT Password
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, itPassword: generatePass() }))}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Regenerate
                    </button>
                  </label>
                  <input type="text" name="itPassword" value={formData.itPassword} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none font-mono" />
                </div>
              </div>
            </div>
            
            {/* Removed Payment Methods to delegate to Tenant Admin */}
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium">Cancel</button>
            <button 
              onClick={handleCreateSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Generate & Create"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium">Business Name</th>
              <th className="px-6 py-4 font-medium">URL & Booking Link</th>
              <th className="px-6 py-4 font-medium">Created Date</th>
              <th className="px-6 py-4 font-medium">Next Due Day</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 opacity-50" />
                  Loading business names...
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No business names found. Create one to get started!
                </td>
              </tr>
            ) : (
              tenants.map((t) => (
                <tr key={t.id} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{t.name}</td>
                  <td className="px-6 py-4">
                    {t.status === "Active" ? (
                      <div className="flex flex-col gap-2">
                        <a href={`/${t.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium transition-colors">
                          <LinkIcon size={14} className="shrink-0" />
                          <span className="truncate">/{t.slug} <span className="text-gray-500 font-normal text-xs ml-1">(Customer)</span></span>
                        </a>
                        <a href={`/${t.slug}/admin`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:underline text-sm font-medium transition-colors">
                          <LinkIcon size={14} className="shrink-0" />
                          <span className="truncate">/{t.slug}/admin <span className="text-gray-500 font-normal text-xs ml-1">(Admin)</span></span>
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 italic text-xs">Links hidden</span>
                        <span className="text-orange-400/80 text-[10px] font-bold uppercase tracking-wider">
                          {t.status === 'Pending' ? 'Subscription Expired' : t.status === 'Suspended' ? 'Account Suspended' : t.status === 'Maintenance' ? 'Under Maintenance' : 'Unavailable'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-orange-400 font-medium">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={t.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        const { updateTenantSettings } = await import("@/actions/tenant");
                        const res = await updateTenantSettings(t.id, { status: newStatus });
                        if (res.success) {
                          loadTenants();
                        } else {
                          alert("Failed to update status");
                        }
                      }}
                      className={`appearance-none cursor-pointer outline-none px-2.5 py-1.5 rounded-full text-xs font-medium text-center ${
                        t.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        t.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        t.status === 'Suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        t.status === 'Maintenance' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}
                    >
                      <option value="Active" className="bg-gray-900 text-white">Active</option>
                      <option value="Pending" className="bg-gray-900 text-white">Pending</option>
                      <option value="Suspended" className="bg-gray-900 text-white">Suspended</option>
                      <option value="Maintenance" className="bg-gray-900 text-white">Maintenance</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedTenant(t); setShowEditConfig(false); }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit & Details"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Suspend Business">
                        <ShieldAlert size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Tenant & Statistics Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-3xl border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900/50">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  {selectedTenant.name}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedTenant.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                    selectedTenant.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    selectedTenant.status === 'Suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    selectedTenant.status === 'Maintenance' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {selectedTenant.status}
                  </span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">/{selectedTenant.slug} • Created: {new Date(selectedTenant.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                  <Download size={16} /> Export Report
                </button>
                <button onClick={() => setSelectedTenant(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><DollarSign size={16} className="text-green-400" /> Revenue</div>
                  <div className="text-2xl font-bold text-white">${tenantStats.revenue.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><CalendarCheck size={16} className="text-blue-400" /> Bookings</div>
                  <div className="text-2xl font-bold text-white">{tenantStats.bookingCount}</div>
                </div>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><UsersIcon size={16} className="text-purple-400" /> Staff</div>
                  <div className="text-2xl font-bold text-white">{tenantStats.staffCount}</div>
                </div>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><Tag size={16} className="text-pink-400" /> Coupons</div>
                  <div className="text-2xl font-bold text-white">{couponCount}</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                
                {/* Form Data Preview / Edit */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Business Configuration</h4>
                  <div className="space-y-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    <div>
                      <span className="block text-xs text-gray-500">Admin Email</span>
                      <span className="text-sm text-gray-200">{selectedTenant.adminEmail}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Location</span>
                      <span className="text-sm text-gray-200">{selectedTenant.location || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Phone</span>
                      <span className="text-sm text-gray-200">{selectedTenant.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Booking Phone</span>
                      <span className="text-sm text-gray-200">{selectedTenant.bookingPhone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Next Due Day</span>
                      <span className="text-sm text-orange-400 font-bold">{selectedTenant.dueDate ? new Date(selectedTenant.dueDate).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEditConfig(true)}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit Configuration
                  </button>
                </div>

                {/* Top Services */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Top Performing Services</h4>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden p-4 text-sm text-gray-400 space-y-2">
                    {tenantStats.topServices.length === 0 ? (
                      <div className="text-center p-2 text-gray-500">No services booked yet.</div>
                    ) : (
                      tenantStats.topServices.map((svc, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-900 p-2.5 rounded-lg border border-gray-800">
                          <span className="font-medium text-gray-300 truncate pr-2">{svc.name}</span>
                          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs shrink-0">{svc.count} bookings</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Edit Configuration Popup (Nested Modal) */}
                {showEditConfig && (
                  <div className="absolute inset-0 bg-gray-800/95 backdrop-blur-md z-10 rounded-2xl border border-gray-700 shadow-2xl p-6 flex flex-col animate-in zoom-in-95">
                    <form onSubmit={handleUpdateConfig} className="flex flex-col h-full">
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Edit2 size={18} className="text-blue-400" /> Edit Configuration
                        </h3>
                        <button type="button" onClick={() => setShowEditConfig(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Business Name</label>
                            <input type="text" name="name" defaultValue={selectedTenant.name} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Admin Email</label>
                            <input type="email" name="adminEmail" defaultValue={selectedTenant.adminEmail} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Admin Password</label>
                            <input type="text" name="adminPassword" defaultValue={selectedTenant.adminPassword} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm font-mono focus:border-blue-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 flex justify-between">
                              IT Account Password (itvicimix)
                              <button 
                                type="button"
                                onClick={(e) => {
                                  const input = e.currentTarget.parentElement?.nextElementSibling as HTMLInputElement;
                                  if (input) input.value = generatePass();
                                }}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                Generate New
                              </button>
                            </label>
                            <input type="text" name="itPassword" defaultValue={selectedTenant.itPassword || generatePass()} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm font-mono focus:border-blue-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Location</label>
                            <input type="text" name="location" defaultValue={selectedTenant.location} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                            <input type="text" name="phone" defaultValue={selectedTenant.phone} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Booking Phone</label>
                            <input type="text" name="bookingPhone" defaultValue={selectedTenant.bookingPhone} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Next Due Day</label>
                            <input type="date" name="dueDate" defaultValue={selectedTenant.dueDate ? new Date(selectedTenant.dueDate).toISOString().split('T')[0] : ""} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Account Status</label>
                            <select name="status" defaultValue={selectedTenant.status} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none bg-gray-900">
                              <option value="Active">Active</option>
                              <option value="Pending">Pending (Expired)</option>
                              <option value="Suspended">Suspended (Admin action)</option>
                              <option value="Maintenance">Maintenance Mode</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-gray-700 flex justify-end gap-2">
                        <button type="button" onClick={() => setShowEditConfig(false)} className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
