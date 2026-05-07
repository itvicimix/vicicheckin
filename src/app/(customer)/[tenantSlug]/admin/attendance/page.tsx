"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Save, Calendar as CalendarIcon, UserCheck, ArrowLeft, Clock } from "lucide-react";
import { getMonthlyAttendance, upsertAttendance } from "@/actions/attendance";
import { getStaff } from "@/actions/staff";
import { getTenantBySlug } from "@/actions/tenant";

export default function AttendancePage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);

  // Month selection state
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [monthlyRecords, setMonthlyRecords] = useState<any[]>([]);
  const [savingDate, setSavingDate] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const t = await getTenantBySlug(tenantSlug);
      if (t) {
        setTenant(t);
        const staff = await getStaff(t.id);
        setStaffList(staff);
      }
      setIsLoading(false);
    };
    init();
  }, [tenantSlug]);

  useEffect(() => {
    if (selectedStaff && tenant) {
      fetchMonthlyData();
    }
  }, [selectedStaff, selectedMonth, selectedYear]);

  const fetchMonthlyData = async () => {
    setIsLoading(true);
    try {
      const res = await getMonthlyAttendance(tenant.id, selectedStaff.id, selectedYear, selectedMonth);
      if (res.success && res.data) {
        // Generate an array for all days in the month
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const records = [];

        // Create a map for quick lookup
        const recordMap = new Map();
        res.data.forEach((r: any) => recordMap.set(r.date, r));

        for (let i = 1; i <= daysInMonth; i++) {
          const dayStr = i.toString().padStart(2, "0");
          const monthStr = selectedMonth.toString().padStart(2, "0");
          const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
          
          const existingRecord = recordMap.get(dateStr);
          records.push({
            date: dateStr,
            clockIn: existingRecord?.clockIn || "",
            clockOut: existingRecord?.clockOut || "",
            status: existingRecord?.status || "Present",
            notes: existingRecord?.notes || "",
            isWeekend: new Date(selectedYear, selectedMonth - 1, i).getDay() === 0 || new Date(selectedYear, selectedMonth - 1, i).getDay() === 6
          });
        }
        setMonthlyRecords(records);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRecord = (date: string, field: string, value: string) => {
    setMonthlyRecords(prev => prev.map(record => {
      if (record.date === date) {
        return { ...record, [field]: value };
      }
      return record;
    }));
  };

  const handleSave = async (date: string) => {
    if (!tenant || !selectedStaff) return;
    setSavingDate(date);
    
    const record = monthlyRecords.find(r => r.date === date);
    if (!record) return;

    try {
      const res = await upsertAttendance({
        tenantId: tenant.id,
        staffId: selectedStaff.id,
        date: record.date,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        status: record.status,
        notes: record.notes
      });

      if (res.success) {
        // Optional: show a small toast, but alert might be annoying if they save many. Let's rely on button state feedback.
      } else {
        alert("Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving record.");
    } finally {
      setSavingDate(null);
    }
  };

  if (isLoading && !tenant && !selectedStaff) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // View 1: Staff Selection Grid
  if (!selectedStaff) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="text-primary" size={28} />
            Staff Attendance
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Select a staff member to manage their monthly timesheet.</p>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
          {staffList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <UserCheck size={48} className="text-gray-300 mb-4" />
              <p>No staff members found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {staffList.map((staff) => (
                <div 
                  key={staff.id} 
                  onClick={() => setSelectedStaff(staff)}
                  className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-xl font-bold">{staff.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{staff.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{staff.role}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // View 2: Monthly Attendance Details
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedStaff(null)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            title="Back to Staff List"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedStaff.name}'s Attendance</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">{selectedStaff.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <CalendarIcon size={16} className="text-gray-400" />
            Month:
          </label>
          <input 
            type="month" 
            value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              if (y && m) {
                setSelectedYear(parseInt(y));
                setSelectedMonth(parseInt(m));
              }
            }}
            className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50/30 p-6">
        {isLoading ? (
           <div className="flex items-center justify-center h-full">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50/80">
                  <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 w-32">Date</th>
                    <th className="px-6 py-4 w-40">Status</th>
                    <th className="px-6 py-4 w-32">Clock In</th>
                    <th className="px-6 py-4 w-32">Clock Out</th>
                    <th className="px-6 py-4">Notes</th>
                    <th className="px-6 py-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {monthlyRecords.map((record) => {
                    // Fix timezone offset issue when parsing date
                    const [y, m, d] = record.date.split('-');
                    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                    
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const isWeekend = record.isWeekend;

                    return (
                      <tr key={record.date} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isWeekend ? 'bg-gray-50/50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className={`font-bold ${isWeekend ? 'text-gray-500' : 'text-gray-900'}`}>{record.date}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{dayName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={record.status}
                            onChange={(e) => handleUpdateRecord(record.date, 'status', e.target.value)}
                            className={`w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary font-medium ${
                              record.status === 'Present' ? 'text-green-600 bg-green-50' : 
                              record.status === 'Absent' ? 'text-red-600 bg-red-50' : 
                              'text-orange-600 bg-orange-50'
                            }`}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Half-day">Half-day</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="time" 
                              value={record.clockIn}
                              onChange={(e) => handleUpdateRecord(record.date, 'clockIn', e.target.value)}
                              className="w-full p-2 pl-8 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="time" 
                              value={record.clockOut}
                              onChange={(e) => handleUpdateRecord(record.date, 'clockOut', e.target.value)}
                              className="w-full p-2 pl-8 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="text" 
                            value={record.notes}
                            onChange={(e) => handleUpdateRecord(record.date, 'notes', e.target.value)}
                            placeholder="Add notes..."
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleSave(record.date)}
                            disabled={savingDate === record.date}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors disabled:opacity-50"
                            title="Save Record"
                          >
                            {savingDate === record.date ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
