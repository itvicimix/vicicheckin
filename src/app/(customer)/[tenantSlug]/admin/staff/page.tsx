"use client";

import { Plus, User, Clock, CalendarOff, Edit2, Trash2, Search, Loader2, X, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getStaff, createStaff, updateStaff, deleteStaff } from "@/actions/staff";
import { getTenantBySlug } from "@/actions/tenant";

const defaultHours: Record<string, string> = {
  Monday: "09:00 - 18:00",
  Tuesday: "09:00 - 18:00",
  Wednesday: "09:00 - 18:00",
  Thursday: "09:00 - 18:00",
  Friday: "09:00 - 18:00",
  Saturday: "Off",
  Sunday: "Off"
};

export default function StaffPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [staffList, setStaffList] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = staffList.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           (s.role && s.role.toLowerCase().includes(q)) ||
           (s.phone && s.phone.includes(q));
  });

  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<any>(null);

  // Form State (used for both Add and Edit)
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("Technician");
  const [formPhone, setFormPhone] = useState("");
  const [formWorkHours, setFormWorkHours] = useState<Record<string, string>>(defaultHours);
  const [formDayOff, setFormDayOff] = useState("None");

  const roles = ["Technician", "Manager", "Cashier", "Staff"];
  const daysOfWeek = ["None", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const t = await getTenantBySlug(tenantSlug);
        if (t) {
          setTenant(t);
          const s = await getStaff(t.id);
          setStaffList(s);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug]);

  const resetForm = () => {
    setFormName("");
    setFormRole("Technician");
    setFormPhone("");
    setFormWorkHours(defaultHours);
    setFormDayOff("None");
  };

  const handleWorkHourChange = (day: string, value: string) => {
    setFormWorkHours(prev => ({ ...prev, [day]: value }));
  };

  const handleCreateStaff = async () => {
    if (!tenant || !formName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await createStaff(tenant.id, {
        name: formName,
        role: formRole,
        phone: formPhone,
        workHours: JSON.stringify(formWorkHours),
        dayOff: formDayOff,
      });

      if (result.success) {
        const updated = await getStaff(tenant.id);
        setStaffList(updated);
        setShowAddForm(false);
        resetForm();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !formName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await updateStaff(editingStaff.id, {
        name: formName,
        role: formRole,
        phone: formPhone,
        workHours: JSON.stringify(formWorkHours),
        dayOff: formDayOff,
      });

      if (result.success) {
        const updated = await getStaff(tenant.id);
        setStaffList(updated);
        setEditingStaff(null);
        resetForm();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (staff: any) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormRole(staff.role || "Technician");
    setFormPhone(staff.phone || "");
    setFormDayOff(staff.dayOff || "None");

    try {
      if (staff.workHours) {
        setFormWorkHours(JSON.parse(staff.workHours));
      } else {
        setFormWorkHours(defaultHours);
      }
    } catch (e) {
      setFormWorkHours(defaultHours);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const result = await deleteStaff(id);
      if (result.success) {
        setStaffList(staffList.filter(s => s.id !== id));
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete staff member");
    }
  };

  const getTodayHours = (workHoursJson: string | null) => {
    if (!workHoursJson) return "Not set";
    try {
      const hours = JSON.parse(workHoursJson);
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      return hours[today] || "Off";
    } catch (e) {
      return "09:00 - 18:00"; // fallback
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
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your team members, schedules, and performance.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
          <button 
            onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add Staff
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-100 animate-in fade-in slide-in-from-top-4 overflow-y-auto max-h-[60vh]">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Team Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input 
                type="text" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="John Doe" 
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(555) 123-4567" 
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
              <select 
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day Off</label>
              <select 
                value={formDayOff}
                onChange={(e) => setFormDayOff(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
              >
                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <h4 className="font-semibold text-gray-800 mb-3 border-t border-gray-200 pt-4">Weekly Work Hours</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(defaultHours).map(day => (
              <div key={day} className="bg-white p-3 rounded-lg border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{day}</label>
                <input 
                  type="text" 
                  value={formWorkHours[day] || ""}
                  onChange={(e) => handleWorkHourChange(day, e.target.value)}
                  placeholder="09:00 - 18:00 or Off" 
                  className="w-full p-2 rounded-md border border-gray-200 focus:border-primary outline-none text-sm" 
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">Cancel</button>
            <button 
              onClick={handleCreateStaff}
              disabled={isSubmitting || !formName}
              className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? "Saving..." : "Save Member"}
            </button>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
        {filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <User className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No staff members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative">
                
                {/* Action Menu */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(staff)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(staff.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{staff.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{staff.role}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                      Active
                    </span>
                  </div>
                </div>

                {staff.phone && (
                  <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    {staff.phone}
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="text-gray-400" />
                      <span>Today's Hours</span>
                    </div>
                    <span className="font-medium text-gray-900">{getTodayHours(staff.workHours)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarOff size={16} className="text-gray-400" />
                      <span>Day Off</span>
                    </div>
                    <span className="font-medium text-gray-900">{staff.dayOff}</span>
                  </div>
                  
                  {/* Full width edit button for better UX on mobile */}
                  <button 
                    onClick={() => openEditModal(staff)}
                    className="w-full mt-2 py-2 bg-gray-50 hover:bg-gray-100 text-primary font-medium text-sm rounded-lg transition-colors border border-gray-200"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <Edit2 size={20} className="text-primary" /> Edit Staff Profile
              </h3>
              <button onClick={() => setEditingStaff(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                  <select 
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day Off</label>
                  <select 
                    value={formDayOff}
                    onChange={(e) => setFormDayOff(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                  >
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mb-3 border-t border-gray-200 pt-4">Weekly Work Hours</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.keys(defaultHours).map(day => (
                  <div key={day} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{day}</label>
                    <input 
                      type="text" 
                      value={formWorkHours[day] || ""}
                      onChange={(e) => handleWorkHourChange(day, e.target.value)}
                      className="w-full p-1.5 rounded bg-white border border-gray-200 focus:border-primary outline-none text-xs" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setEditingStaff(null)} 
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateStaff}
                disabled={isSubmitting || !formName}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-md flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
