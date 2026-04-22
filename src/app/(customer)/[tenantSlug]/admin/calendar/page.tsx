"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

import { getTenantBySlug } from "@/actions/tenant";
import { getBookings, createBooking } from "@/actions/booking";
import { getServices } from "@/actions/service";
import { getStaff } from "@/actions/staff";

export default function CalendarPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{day: number, dateStr: string, bookings: any[]} | null>(null);
  const [dbBookings, setDbBookings] = useState<Record<number, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal Form State
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formServiceId, setFormServiceId] = useState("");
  const [formStaffId, setFormStaffId] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState("09:00");
  const [isSaving, setIsSaving] = useState(false);

  const fetchRealBookings = async (t: any) => {
    try {
      const bookingsList = await getBookings(t.id);
      
      const grouped: Record<number, any[]> = {};
      bookingsList.forEach(b => {
        const bDate = new Date(b.date);
        if (bDate.getMonth() === currentDate.getMonth() && bDate.getFullYear() === currentDate.getFullYear()) {
          const parts = b.date.split('-');
          const correctDay = parseInt(parts[2], 10);
          
          if (!grouped[correctDay]) grouped[correctDay] = [];
          grouped[correctDay].push({
            time: b.time,
            customer: b.customerName,
            service: b.service?.name || "Unknown Service",
          });
        }
      });
      setDbBookings(grouped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'add-booking') {
        setShowAddForm(true);
      }
    }
    
    const initData = async () => {
      setIsLoading(true);
      try {
        const t = await getTenantBySlug(tenantSlug);
        if (t) {
          setTenant(t);
          await fetchRealBookings(t);
          
          const [svcs, stf] = await Promise.all([
            getServices(t.id),
            getStaff(t.id)
          ]);
          setServices(svcs);
          setStaffList(stf);
          if (svcs.length > 0) setFormServiceId(svcs[0].id);
          if (stf.length > 0) setFormStaffId(stf[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, [tenantSlug, currentDate.getMonth()]);

  const handleSaveBooking = async () => {
    if (!tenant || !formName || !formServiceId || isSaving) return;
    
    const selectedService = services.find(s => s.id === formServiceId);
    const selectedStaff = staffList.find(s => s.id === formStaffId);

    setIsSaving(true);
    try {
      const result = await createBooking({
        tenantId: tenant.id,
        customerName: formName,
        customerPhone: formPhone,
        service: {
          id: selectedService.id,
          name: selectedService.name,
          price: selectedService.price.toString(),
          duration: selectedService.duration
        },
        staff: selectedStaff ? {
          id: selectedStaff.id,
          name: selectedStaff.name
        } : null,
        date: formDate,
        time: formTime,
      });

      if (result.success) {
        await fetchRealBookings(tenant);
        setShowAddForm(false);
        // Reset form
        setFormName("");
        setFormPhone("");
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save booking");
    } finally {
      setIsSaving(false);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100vh-8rem)] flex flex-col relative">

      
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={prevMonth} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-medium">Today</button>
            <button onClick={nextMonth} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Add Booking
        </button>
      </div>

      {/* Add Booking Modal */}
      {showAddForm && (
        <div className="absolute inset-0 bg-black/40 z-20 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-gray-900">Add Walk-in Booking</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Jane Doe" 
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(555) 000-0000" 
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
                <select 
                  value={formServiceId}
                  onChange={(e) => setFormServiceId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                  ))}
                  {services.length === 0 && <option>No services available</option>}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Staff</label>
                <select 
                  value={formStaffId}
                  onChange={(e) => setFormStaffId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                >
                  <option value="">Any Available</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors border border-gray-200">
                Cancel
              </button>
              <button 
                onClick={handleSaveBooking}
                disabled={isSaving}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-gray-50/50 p-6">
        <div className="grid grid-cols-7 gap-4 min-h-full">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-500 text-sm py-2">
              {day}
            </div>
          ))}
          
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] bg-transparent rounded-xl border border-transparent"></div>
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            const dayBookings = dbBookings[day] || [];

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDayInfo({
                  day, 
                  dateStr: `${monthNames[currentDate.getMonth()]} ${day}, ${currentDate.getFullYear()}`, 
                  bookings: dayBookings 
                })}
                className={`min-h-[120px] bg-white rounded-xl border ${isToday ? 'border-primary ring-1 ring-primary' : 'border-gray-200'} p-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="text-xs font-medium text-gray-500">{dayBookings.length} appts</span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                  {dayBookings.map((b, idx) => (
                    <div key={idx} className="bg-primary/10 border-l-2 border-primary text-primary px-2 py-1.5 rounded text-xs truncate">
                      <span className="font-semibold">{b.time}</span> {b.customer}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Day Details Modal */}
      {selectedDayInfo && (
        <div className="absolute inset-0 bg-black/40 z-20 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Appointments</h3>
                <p className="text-sm text-gray-500">{selectedDayInfo.dateStr}</p>
              </div>
              <button onClick={() => setSelectedDayInfo(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {selectedDayInfo.bookings.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>No appointments scheduled for this day.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayInfo.bookings.map((b, idx) => (
                    <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:border-primary transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg text-sm">
                          {b.time}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{b.customer}</p>
                          <p className="text-sm text-gray-500">{b.service}</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-blue-600 hover:underline">
                        Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => {
                  setSelectedDayInfo(null);
                  setShowAddForm(true);
                }} 
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
              >
                <Plus size={16} /> Add New Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
