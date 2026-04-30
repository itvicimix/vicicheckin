"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Clock, CalendarOff, Users, Save, Loader2, Plus, Trash2, CheckCircle } from "lucide-react";
import { getTenantBySlug } from "@/actions/tenant";
import { updateWorkingHours } from "@/actions/tenant";
import { getStaff, updateStaffTimeOff } from "@/actions/staff";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WorkingHoursPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [tenant, setTenant] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState("weekly");

  // State for Weekly Hours
  const [weeklyHours, setWeeklyHours] = useState<any>({});
  
  // State for Holidays
  const [holidays, setHolidays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState("");

  // State for Staff Time Off
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [staffTimeOff, setStaffTimeOff] = useState<string[]>([]);
  const [newStaffOffDate, setNewStaffOffDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const t = await getTenantBySlug(tenantSlug);
      if (t) {
        setTenant(t);
        
        // Parse Weekly Hours
        let defaultWeekly: any = {};
        DAYS_OF_WEEK.forEach(day => {
          defaultWeekly[day] = { isOpen: true, openTime: "09:00", closeTime: "18:00" };
        });
        
        if (t.workingHours) {
          try {
            const parsed = JSON.parse(t.workingHours);
            setWeeklyHours({ ...defaultWeekly, ...parsed });
          } catch(e) {
            setWeeklyHours(defaultWeekly);
          }
        } else {
          setWeeklyHours(defaultWeekly);
        }

        // Parse Holidays
        if (t.holidays) {
          try {
            setHolidays(JSON.parse(t.holidays));
          } catch(e) {
            setHolidays([]);
          }
        }

        // Fetch Staff
        const stf = await getStaff(t.id);
        setStaffList(stf);
        if (stf.length > 0) {
          setSelectedStaffId(stf[0].id);
          try {
             setStaffTimeOff(stf[0].timeOffDates ? JSON.parse(stf[0].timeOffDates) : []);
          } catch(e) {
             setStaffTimeOff([]);
          }
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [tenantSlug]);

  // When selected staff changes
  useEffect(() => {
    if (selectedStaffId) {
      const staff = staffList.find(s => s.id === selectedStaffId);
      if (staff) {
        try {
          setStaffTimeOff(staff.timeOffDates ? JSON.parse(staff.timeOffDates) : []);
        } catch(e) {
          setStaffTimeOff([]);
        }
      }
    }
  }, [selectedStaffId, staffList]);

  const handleWeeklyChange = (day: string, field: string, value: any) => {
    setWeeklyHours({
      ...weeklyHours,
      [day]: { ...weeklyHours[day], [field]: value }
    });
  };

  const handleAddHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays([...holidays, newHoliday].sort());
      setNewHoliday("");
    }
  };

  const handleRemoveHoliday = (date: string) => {
    setHolidays(holidays.filter(h => h !== date));
  };

  const handleAddStaffTimeOff = () => {
    if (newStaffOffDate && !staffTimeOff.includes(newStaffOffDate)) {
      setStaffTimeOff([...staffTimeOff, newStaffOffDate].sort());
      setNewStaffOffDate("");
    }
  };

  const handleRemoveStaffTimeOff = (date: string) => {
    setStaffTimeOff(staffTimeOff.filter(d => d !== date));
  };

  const handleSaveWorkingHoursAndHolidays = async () => {
    if (!tenant) return;
    setIsSaving(true);
    setSaveSuccess(false);
    
    const result = await updateWorkingHours(tenant.id, {
      workingHours: weeklyHours,
      holidays: holidays
    });

    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert(result.error);
    }
    setIsSaving(false);
  };

  const handleSaveStaffTimeOff = async () => {
    if (!selectedStaffId) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const result = await updateStaffTimeOff(selectedStaffId, staffTimeOff);
    if (result.success) {
      // Update local staff list state
      setStaffList(staffList.map(s => s.id === selectedStaffId ? { ...s, timeOffDates: JSON.stringify(staffTimeOff) } : s));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert(result.error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Working Hours</h2>
          <p className="text-gray-500 text-sm mt-1">Manage weekly schedule, holidays, and staff time off.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab("weekly")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'weekly' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Clock size={16} /> Weekly Hours
          </button>
          <button 
            onClick={() => setActiveTab("holidays")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'holidays' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CalendarOff size={16} /> Salon Holidays
          </button>
          <button 
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'staff' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={16} /> Staff Time Off
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* WEEKLY HOURS TAB */}
        {activeTab === "weekly" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2 text-gray-900 font-bold bg-gray-50/50">
              <Clock size={20} className="text-primary" />
              Regular Weekly Schedule
            </div>
            <div className="p-6 space-y-4">
              {DAYS_OF_WEEK.map(day => {
                const config = weeklyHours[day] || { isOpen: false, openTime: "09:00", closeTime: "18:00" };
                return (
                  <div key={day} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4 w-1/3">
                      <button 
                        onClick={() => handleWeeklyChange(day, 'isOpen', !config.isOpen)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${config.isOpen ? 'bg-primary' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className={`font-semibold ${config.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      {config.isOpen ? (
                        <>
                          <input 
                            type="time" 
                            value={config.openTime}
                            onChange={(e) => handleWeeklyChange(day, 'openTime', e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg outline-none focus:border-primary text-sm font-medium"
                          />
                          <span className="text-gray-400">-</span>
                          <input 
                            type="time" 
                            value={config.closeTime}
                            onChange={(e) => handleWeeklyChange(day, 'closeTime', e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg outline-none focus:border-primary text-sm font-medium"
                          />
                        </>
                      ) : (
                        <span className="text-gray-400 font-medium text-sm italic px-4">Closed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <div className="flex items-center gap-4">
                {saveSuccess && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={16} /> Saved!</span>}
                <button 
                  onClick={handleSaveWorkingHoursAndHolidays}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HOLIDAYS TAB */}
        {activeTab === "holidays" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <CalendarOff size={20} className="text-red-500" />
                Salon Holidays (Entire Salon Closed)
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input 
                  type="date" 
                  value={newHoliday}
                  onChange={(e) => setNewHoliday(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
                />
                <button 
                  onClick={handleAddHoliday}
                  disabled={!newHoliday}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} /> Add Holiday
                </button>
              </div>

              <div className="space-y-2">
                {holidays.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 italic border border-dashed border-gray-200 rounded-xl">No holidays configured yet.</p>
                ) : (
                  holidays.map(date => (
                    <div key={date} className="flex justify-between items-center p-4 border border-red-100 bg-red-50/30 rounded-xl">
                      <span className="font-medium text-gray-800 flex items-center gap-2">
                        <CalendarOff size={16} className="text-red-400" />
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => handleRemoveHoliday(date)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <div className="flex items-center gap-4">
                {saveSuccess && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={16} /> Saved!</span>}
                <button 
                  onClick={handleSaveWorkingHoursAndHolidays}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Holidays
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAFF TIME OFF TAB */}
        {activeTab === "staff" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <Users size={20} className="text-blue-500" />
                  Staff Specific Time Off
                </div>
                <select 
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white font-medium min-w-[200px]"
                >
                  {staffList.length === 0 && <option value="">No staff available</option>}
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-6">
              {!selectedStaffId ? (
                <p className="text-center text-gray-500 py-8 italic">Please select a staff member first.</p>
              ) : (
                <>
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="date" 
                      value={newStaffOffDate}
                      onChange={(e) => setNewStaffOffDate(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
                    />
                    <button 
                      onClick={handleAddStaffTimeOff}
                      disabled={!newStaffOffDate}
                      className="bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} /> Add Time Off
                    </button>
                  </div>

                  <div className="space-y-2">
                    {staffTimeOff.length === 0 ? (
                      <p className="text-center text-gray-500 py-8 italic border border-dashed border-gray-200 rounded-xl">No specific time off configured for this staff.</p>
                    ) : (
                      staffTimeOff.map(date => (
                        <div key={date} className="flex justify-between items-center p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
                          <span className="font-medium text-gray-800 flex items-center gap-2">
                            <CalendarOff size={16} className="text-blue-400" />
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <button 
                            onClick={() => handleRemoveStaffTimeOff(date)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <div className="flex items-center gap-4">
                {saveSuccess && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={16} /> Saved!</span>}
                <button 
                  onClick={handleSaveStaffTimeOff}
                  disabled={isSaving || !selectedStaffId}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Staff Time Off
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
