"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import { getServices, createService, deleteService, updateService } from "@/actions/service";
import { getTenantBySlug } from "@/actions/tenant";

export default function ServicesPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  
  const [services, setServices] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState(["Nails", "Spa", "Hair"]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
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
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              placeholder="Search services..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
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

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
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
            {services.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No services found. Add your first service above.
                </td>
              </tr>
            ) : (
              services.map((service) => (
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
                        onClick={() => handleDelete(service.id)}
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

    </div>
  );
}
