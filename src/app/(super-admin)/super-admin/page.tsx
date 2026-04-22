"use client";

import { useState } from "react";
import { Plus, Link as LinkIcon, Edit2, ShieldAlert, X, Download, DollarSign, CalendarCheck, Users as UsersIcon, Scissors as ScissorsIcon, Save } from "lucide-react";

export default function TenantsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showEditConfig, setShowEditConfig] = useState(false);
  
  // Create form state for payments
  const [payments, setPayments] = useState({ payInStore: true, creditCard: false, paypal: false });

  const mockTenants = [
    { 
      id: "luxury-spa", name: "Luxury Spa & Nail", created: "2023-10-15", expires: "2024-10-15", status: "Active", password: "TempPassword123!",
      stats: { revenue: "$45,200", appointments: 1240, staff: 8, servicesCount: 24, topServices: ["Gel Manicure", "Aromatherapy Massage"], payments: ["Pay in Store", "Credit Card"] }
    },
    { 
      id: "head-spa-pro", name: "Head Spa Pro", created: "2023-11-20", expires: "2024-11-20", status: "Active", password: "HeadSpaOwner2024",
      stats: { revenue: "$32,150", appointments: 850, staff: 5, servicesCount: 15, topServices: ["Herbal Head Spa", "Scalp Detox"], payments: ["Pay in Store", "Paypal"] }
    },
    { 
      id: "nail-art-studio", name: "Nail Art Studio", created: "2022-05-10", expires: "2023-05-10", status: "Expired", password: "NailsRule2022",
      stats: { revenue: "$12,400", appointments: 320, staff: 3, servicesCount: 12, topServices: ["Acrylic Nails", "Nail Art Custom"], payments: ["Pay in Store"] }
    },
  ];

  const togglePayment = (method: keyof typeof payments) => {
    setPayments(prev => ({ ...prev, [method]: !prev[method] }));
  };

  return (
    <div className="space-y-6 text-gray-100">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tenant Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage salons, generate booking links, and handle subscriptions.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} /> New Tenant
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">Create New Tenant (Salon)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Salon Name</label>
              <input type="text" placeholder="e.g., Star Nails" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">URL Slug</label>
              <input type="text" placeholder="e.g., star-nails" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Admin Email</label>
              <input type="email" placeholder="owner@starnails.com" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Admin Password</label>
              <input type="text" placeholder="Generated password" defaultValue="TempPass123!" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Theme Color (Hex)</label>
              <input type="text" placeholder="#724677" defaultValue="#724677" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Logo</label>
              <input type="file" accept="image/*" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 focus:border-blue-500 outline-none transition-colors cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Location</label>
              <input type="text" placeholder="e.g., 123 Beauty Ave" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
              <input type="text" placeholder="e.g., (555) 123-4567" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            
            {/* Payment Methods */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <label className="block text-sm text-gray-400 mb-2">Accepted Payment Methods</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-gray-900 px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <input type="checkbox" checked={payments.payInStore} onChange={() => togglePayment('payInStore')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 bg-gray-800 border-gray-600" />
                  <span className="text-sm">Pay in Store</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-gray-900 px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <input type="checkbox" checked={payments.creditCard} onChange={() => togglePayment('creditCard')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 bg-gray-800 border-gray-600" />
                  <span className="text-sm">Credit Card</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-gray-900 px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <input type="checkbox" checked={payments.paypal} onChange={() => togglePayment('paypal')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 bg-gray-800 border-gray-600" />
                  <span className="text-sm">PayPal</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium">Cancel</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20">Generate & Create</button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium">Tenant Name</th>
              <th className="px-6 py-4 font-medium">URL & Booking Link</th>
              <th className="px-6 py-4 font-medium">Created Date</th>
              <th className="px-6 py-4 font-medium">Expiry (1 Year)</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mockTenants.map((t) => (
              <tr key={t.id} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{t.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <a href={`/${t.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium transition-colors">
                      <LinkIcon size={14} className="shrink-0" />
                      <span className="truncate">/{t.id} <span className="text-gray-500 font-normal text-xs ml-1">(Customer)</span></span>
                    </a>
                    <a href={`/${t.id}/admin`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:underline text-sm font-medium transition-colors">
                      <LinkIcon size={14} className="shrink-0" />
                      <span className="truncate">/{t.id}/admin <span className="text-gray-500 font-normal text-xs ml-1">(Admin)</span></span>
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{t.created}</td>
                <td className="px-6 py-4 text-gray-400">{t.expires}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    t.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setSelectedTenant(t); setShowEditConfig(false); }}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit & Details"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Suspend Tenant">
                      <ShieldAlert size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
                    selectedTenant.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {selectedTenant.status}
                  </span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">/{selectedTenant.id} • Created: {selectedTenant.created}</p>
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
                  <div className="text-2xl font-bold text-white">{selectedTenant.stats.revenue}</div>
                </div>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><CalendarCheck size={16} className="text-blue-400" /> Bookings</div>
                  <div className="text-2xl font-bold text-white">{selectedTenant.stats.appointments}</div>
                </div>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><UsersIcon size={16} className="text-purple-400" /> Staff</div>
                  <div className="text-2xl font-bold text-white">{selectedTenant.stats.staff}</div>
                </div>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><ScissorsIcon size={16} className="text-orange-400" /> Services</div>
                  <div className="text-2xl font-bold text-white">{selectedTenant.stats.servicesCount}</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                
                {/* Form Data Preview / Edit */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tenant Configuration</h4>
                  <div className="space-y-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    <div>
                      <span className="block text-xs text-gray-500">Admin Email</span>
                      <span className="text-sm text-gray-200">owner@{selectedTenant.id}.com</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Location</span>
                      <span className="text-sm text-gray-200">123 Beauty Ave, NY</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Phone</span>
                      <span className="text-sm text-gray-200">(555) 123-4567</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Accepted Payments</span>
                      <div className="flex gap-2 flex-wrap">
                        {selectedTenant.stats.payments.map((p: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs text-gray-300">
                            {p}
                          </span>
                        ))}
                      </div>
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
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                    {selectedTenant.stats.topServices.map((service: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700 text-gray-400'}`}>
                            #{idx + 1}
                          </div>
                          <span className="text-sm text-gray-200 font-medium">{service}</span>
                        </div>
                        <span className="text-xs text-gray-500">High demand</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Configuration Popup (Nested Modal) */}
                {showEditConfig && (
                  <div className="absolute inset-0 bg-gray-800/95 backdrop-blur-md z-10 rounded-2xl border border-gray-700 shadow-2xl p-6 flex flex-col animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Edit2 size={18} className="text-blue-400" /> Edit Configuration
                      </h3>
                      <button onClick={() => setShowEditConfig(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Admin Email</label>
                        <input type="email" defaultValue={`owner@${selectedTenant.id}.com`} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Admin Password</label>
                        <input type="text" defaultValue={selectedTenant.password} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm font-mono focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Location</label>
                        <input type="text" defaultValue="123 Beauty Ave, NY" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                        <input type="text" defaultValue="(555) 123-4567" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Payment Methods</label>
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300">
                            <input type="checkbox" defaultChecked={selectedTenant.stats.payments.includes("Pay in Store")} className="rounded text-blue-600 bg-gray-800 border-gray-600" />
                            Pay in Store
                          </label>
                          <label className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300">
                            <input type="checkbox" defaultChecked={selectedTenant.stats.payments.includes("Credit Card")} className="rounded text-blue-600 bg-gray-800 border-gray-600" />
                            Credit Card
                          </label>
                          <label className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300">
                            <input type="checkbox" defaultChecked={selectedTenant.stats.payments.includes("Paypal")} className="rounded text-blue-600 bg-gray-800 border-gray-600" />
                            PayPal
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-gray-700 flex justify-end gap-2">
                      <button onClick={() => setShowEditConfig(false)} className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                      <button onClick={() => setShowEditConfig(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
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
