"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Search, MoreVertical, Edit2, History, Star, Plus, Trash2, Loader2, Upload, RefreshCw } from "lucide-react";
import { getCustomers, createCustomer, deleteCustomer, updateCustomer, importCustomers, deleteCustomers } from "@/actions/customer";
import { getTenantBySlug } from "@/actions/tenant";

export default function CustomersPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk Select State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formVip, setFormVip] = useState(false);

  const fetchCustomers = async (tId: string) => {
    const c = await getCustomers(tId);
    setCustomers(c);
    setFilteredCustomers(c);
    setSelectedIds([]); // Reset selection on data change
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const t = await getTenantBySlug(tenantSlug);
        if (t) {
          setTenant(t);
          await fetchCustomers(t.id);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on search
    if (!searchQuery) {
      setFilteredCustomers(customers);
    } else {
      const lower = searchQuery.toLowerCase();
      setFilteredCustomers(
        customers.filter(c => 
          c.name.toLowerCase().includes(lower) || 
          (c.phone && c.phone.includes(lower)) || 
          (c.email && c.email.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchQuery, customers]);

  const handleSaveCustomer = async () => {
    if (!tenant || !formName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        const result = await updateCustomer(editingCustomer.id, {
          name: formName,
          phone: formPhone,
          email: formEmail,
          vip: formVip,
        });

        if (result.success) {
          await fetchCustomers(tenant.id);
          closeForm();
        } else {
          alert(result.error);
        }
      } else {
        const result = await createCustomer(tenant.id, {
          name: formName,
          phone: formPhone,
          email: formEmail,
          vip: formVip,
        });

        if (result.success) {
          await fetchCustomers(tenant.id);
          closeForm();
        } else {
          alert(result.error);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error saving customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormVip(false);
  };

  const handleEditClick = (c: any) => {
    setEditingCustomer(c);
    setFormName(c.name || "");
    setFormPhone(c.phone || "");
    setFormEmail(c.email || "");
    setFormVip(c.vip || false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer? All related history may be affected.")) return;

    try {
      const result = await deleteCustomer(id);
      if (result.success) {
        setCustomers(customers.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(selId => selId !== id));
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting customer");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected customers? This action cannot be undone.`)) return;

    setIsBulkDeleting(true);
    try {
      const result = await deleteCustomers(selectedIds);
      if (result.success) {
        await fetchCustomers(tenant.id);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting multiple customers");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id)); // Select all
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(selId => selId !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      // Simple CSV Parse (Assumes headers: name, phone, email)
      const rows = text.split("\n").map(r => r.trim()).filter(r => r);
      if (rows.length < 2) {
        alert("Invalid CSV file or no data found.");
        setIsUploading(false);
        return;
      }

      const headers = rows[0].toLowerCase().split(",");
      const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("tên"));
      const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("sđt") || h.includes("sdt"));
      const emailIdx = headers.findIndex(h => h.includes("email"));

      if (nameIdx === -1) {
        alert("CSV file must have at least one column containing a name (header must contain 'name').");
        setIsUploading(false);
        return;
      }

      const parsedCustomers = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",");
        if (cols[nameIdx] && cols[nameIdx].trim()) {
          parsedCustomers.push({
            name: cols[nameIdx].trim(),
            phone: phoneIdx !== -1 && cols[phoneIdx] ? cols[phoneIdx].trim() : "",
            email: emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx].trim() : "",
          });
        }
      }

      if (parsedCustomers.length === 0) {
        alert("No valid customer data found in the file.");
        setIsUploading(false);
        return;
      }

      const result = await importCustomers(tenant.id, parsedCustomers);
      if (result.success) {
        alert(`Successfully imported ${result.count} customers!`);
        await fetchCustomers(tenant.id);
      } else {
        alert("Import error: " + result.error);
      }
    } catch (error) {
      console.error("Error reading CSV file:", error);
      alert("An error occurred while processing the CSV file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)] relative">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage customers, view their history and spending.</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto flex-wrap lg:flex-nowrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs border border-red-200 disabled:opacity-50"
              >
                {isBulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete ({selectedIds.length})
              </button>
            )}

            <button 
              onClick={async () => {
                if (confirm("Sync data?")) {
                  const { syncCustomersData } = await import("@/actions/customer");
                  setIsUploading(true);
                  const res = await syncCustomersData(tenant.id);
                  setIsUploading(false);
                  if (res.success) alert("Synced successfully!");
                }
              }}
              disabled={isUploading}
              className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap border border-blue-100"
            >
              Sync
            </button>
            
            <button 
              onClick={() => {
                setEditingCustomer(null);
                setShowForm(true);
              }}
              className="bg-primary text-white px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap ml-auto sm:ml-0"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Customer Inline Form */}
      {showForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-100 animate-in fade-in slide-in-from-top-4 shrink-0 shadow-inner z-20">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{editingCustomer ? "Edit Customer" : "Add New Customer"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input 
                type="text" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. John Doe" 
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="0987654321" 
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com" 
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-transparent hover:bg-gray-100 rounded-lg transition-colors">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={formVip}
                    onChange={(e) => setFormVip(e.target.checked)}
                    className="w-5 h-5 accent-yellow-400 rounded cursor-pointer" 
                  />
                </div>
                <div className="flex items-center gap-1.5 font-medium text-gray-700 select-none">
                  <Star size={18} className={formVip ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  Mark as VIP
                </div>
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={closeForm} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">Cancel</button>
            <button 
              onClick={handleSaveCustomer}
              disabled={isSubmitting}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table Content */}
      <div className="flex-1 overflow-auto relative z-0 hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr className="text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Tier & Points</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold text-center">Visits</th>
              <th className="px-6 py-4 font-semibold">Last Visit</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((c) => (
                <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(c.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {c.name}
                          {c.vip && <Star size={14} className="text-yellow-400 fill-yellow-400" />}
                        </div>
                        <div className="text-xs text-gray-500">ID: #{c.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${
                        c.tier === "Diamond" || c.tier === "Kim cương" ? "bg-purple-100 text-purple-800" :
                        c.tier === "Gold" || c.tier === "Vàng" ? "bg-yellow-100 text-yellow-800" :
                        c.tier === "Silver" || c.tier === "Bạc" ? "bg-slate-200 text-slate-700" :
                        c.tier === "Bronze" || c.tier === "Đồng" ? "bg-amber-100 text-amber-800" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {c.tier}
                      </span>
                      <span className="text-sm font-medium text-gray-900 mt-1">{c.points} pts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{c.phone || "No phone"}</div>
                    <div className="text-gray-500">{c.email || "No email"}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block bg-gray-100 text-gray-800 font-bold px-2 py-1 rounded-md text-xs">
                      {c.visits || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.lastVisit !== "No visits" ? new Date(c.lastVisit).toLocaleDateString() : "Never visited"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(c)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="History">
                        <History size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Content */}
      <div className="flex-1 overflow-auto md:hidden p-4 space-y-3 bg-gray-50/50">
        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
            No customers found.
          </div>
        ) : (
          paginatedCustomers.map((c) => (
            <div key={c.id} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3 ${selectedIds.includes(c.id) ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3" onClick={() => toggleSelect(c.id)}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      {c.name}
                      {c.vip && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                    </div>
                    <div className="text-xs text-gray-500">{c.phone || "No phone"}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    c.tier === "Diamond" || c.tier === "Kim cương" ? "bg-purple-100 text-purple-800" :
                    c.tier === "Gold" || c.tier === "Vàng" ? "bg-yellow-100 text-yellow-800" :
                    c.tier === "Silver" || c.tier === "Bạc" ? "bg-slate-200 text-slate-700" :
                    c.tier === "Bronze" || c.tier === "Đồng" ? "bg-amber-100 text-amber-800" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {c.tier}
                  </span>
                  <span className="text-xs font-bold text-gray-900">{c.points} pts</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Visits</div>
                    <div className="text-sm font-bold text-gray-900">{c.visits || 0}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Last Visit</div>
                    <div className="text-xs font-medium text-gray-900">{c.lastVisit !== "No visits" ? new Date(c.lastVisit).toLocaleDateString() : "-"}</div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={() => handleEditClick(c)} className="p-2 text-gray-400 hover:text-primary"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 bg-white mt-auto shrink-0 z-10 gap-3">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <div className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-lg border border-gray-100">
              Page {currentPage} of {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
