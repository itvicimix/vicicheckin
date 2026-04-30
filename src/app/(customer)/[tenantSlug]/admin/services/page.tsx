"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Loader2, Upload, FileJson } from "lucide-react";
import { getServices, createService, deleteService, updateService, importServices } from "@/actions/service";
import { getTenantBySlug } from "@/actions/tenant";

export default function ServicesPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  
  const [services, setServices] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [categories, setCategories] = useState(["Nails", "Spa", "Hair"]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredServices = services.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           (s.category && s.category.toLowerCase().includes(q));
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  
  // Edit State
  const [editingService, setEditingService] = useState<any>(null);
  
  // Form State (shared for add/edit)
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Nails");
  const [formDuration, setFormDuration] = useState("45");
  const [formPrice, setFormPrice] = useState("35");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const t = await getTenantBySlug(tenantSlug);
        if (t) {
          setTenant(t);
          const s = await getServices(t.id);
          setServices(s);
          
          // Extract unique categories from services
          const uniqueCats = Array.from(new Set([...categories, ...s.map((svc: any) => svc.category).filter(Boolean)]));
          setCategories(uniqueCats);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug]);

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setFormCategory(newCategoryName.trim());
    }
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setFormName(service.name);
    setFormCategory(service.category || "General");
    setFormDuration(service.duration.toString());
    setFormPrice(service.price.toString());
  };

  const handleCreateOrUpdate = async () => {
    if (!tenant || !formName || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      let result;
      if (editingService) {
        result = await updateService(editingService.id, {
          name: formName,
          category: formCategory,
          duration: formDuration,
          price: formPrice
        });
      } else {
        result = await createService(tenant.id, {
          name: formName,
          category: formCategory,
          duration: formDuration,
          price: formPrice
        });
      }
      
      if (result.success) {
        const updated = await getServices(tenant.id);
        setServices(updated);
        setShowAddForm(false);
        setEditingService(null);
        // Reset form
        setFormName("");
        setFormPrice("35");
        setFormDuration("45");
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptDelete = (id: string) => {
    setServiceToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    const id = serviceToDelete;
    
    try {
      const result = await deleteService(id);
      if (result.success) {
        setServices(services.filter(s => s.id !== id));
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete service");
    } finally {
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          // Look for 'services' key or assume flat array
          const servicesToImport = Array.isArray(json) ? json : (json.services || json.service || []);
          
          if (servicesToImport.length === 0) {
            alert("No services found in file");
            return;
          }

          const result = await importServices(tenant.id, servicesToImport);
          if (result.success) {
            alert(`Successfully imported ${result.count} services!`);
            const updated = await getServices(tenant.id);
            setServices(updated);
          } else {
            alert("Import failed: " + result.error);
          }
        } catch (err) {
          alert("Invalid JSON file");
        } finally {
          setIsImporting(false);
          e.target.value = "";
        }
      };
      reader.readAsText(file);
    } catch (error) {
      alert("Error reading file");
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)] relative">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage all your offered services and pricing.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
          
          <label className={`bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
            {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button 
            onClick={() => { setShowAddForm(!showAddForm); setEditingService(null); }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add Service
          </button>
        </div>
      </div>

      {/* Add/Edit Service Inline Form */}
      {showAddForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{editingService ? "Edit Service" : "Add New Service"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input 
                type="text" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Deluxe Spa Pedicure" 
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                {!isAddingCategory && (
                  <button 
                    onClick={() => setIsAddingCategory(true)}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add New
                  </button>
                )}
              </div>
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category..." 
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" 
                  />
                  <button onClick={handleAddCategory} className="bg-primary text-white px-3 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">Save</button>
                  <button onClick={() => setIsAddingCategory(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2">Cancel</button>
                </div>
              ) : (
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input 
                type="number" 
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                placeholder="45" 
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
              <input 
                type="text" 
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="35" 
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button 
              onClick={() => { setShowAddForm(false); setEditingService(null); }} 
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateOrUpdate}
              disabled={isSubmitting}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : (editingService ? "Update Service" : "Save Service")}
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table Content */}
      <div className="flex-1 overflow-auto hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr className="text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-semibold">Service Name</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Duration (min)</th>
              <th className="px-6 py-4 font-semibold">Price ($)</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No services found. Add your first service above.
                </td>
              </tr>
            ) : (
              paginatedServices.map((service) => (
                <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {service.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{service.duration}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">${service.price}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { openEditModal(service); setShowAddForm(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => promptDelete(service.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      <div className="flex-1 overflow-auto md:hidden p-4 space-y-4 bg-gray-50/50">
        {filteredServices.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
            No services found. Add your first service above.
          </div>
        ) : (
          paginatedServices.map((service) => (
            <div key={service.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-900">{service.name}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {service.category || "General"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">${service.price}</div>
                  <div className="text-[10px] text-gray-400 font-medium">{service.duration} min</div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => { openEditModal(service); setShowAddForm(true); }}
                  className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium text-xs rounded-lg transition-colors border border-gray-100"
                >
                  Edit
                </button>
                <button 
                  onClick={() => promptDelete(service.id)}
                  className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-lg transition-colors border border-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 bg-white mt-auto shrink-0 z-10 gap-3">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} entries
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

      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Service</h3>
            <p className="text-gray-500 text-sm mb-8">
              Are you sure you want to delete this service? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDeleteModalOpen(false); setServiceToDelete(null); }}
                className="px-6 py-2.5 bg-[#f3e8ff] text-[#6b21a8] hover:bg-[#e9d5ff] font-semibold rounded-2xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-[#7e57c2] hover:bg-[#673ab7] text-white font-semibold rounded-2xl transition-all text-sm shadow-sm ring-2 ring-offset-2 ring-[#7e57c2]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
