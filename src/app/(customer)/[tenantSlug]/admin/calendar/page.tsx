"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Loader2 } from "lucide-react";

import { getTenantBySlug } from "@/actions/tenant";
import { getBookings, createBooking } from "@/actions/booking";
import { getServices } from "@/actions/service";
import { getStaff } from "@/actions/staff";
import { getUnusedPromotion } from "@/actions/promotion";
import { validateCoupon } from "@/actions/coupon";

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
  const [bookingItems, setBookingItems] = useState<any[]>([{ serviceId: "", staffId: "", date: new Date().toISOString().split('T')[0], time: "09:00" }]);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [formNotes, setFormNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchRealBookings = async (t: any) => {
    try {
      const bookingsList = await getBookings(t.id);
      
      const grouped: Record<number, any[]> = {};
      bookingsList.forEach((b: any) => {
        const bDate = new Date(b.date);
        if (bDate.getMonth() === currentDate.getMonth() && bDate.getFullYear() === currentDate.getFullYear()) {
          const parts = b.date.split('-');
          const correctDay = parseInt(parts[2], 10);
          
          if (!grouped[correctDay]) grouped[correctDay] = [];
          grouped[correctDay].push({
            time: b.time,
            customer: b.customerName,
            service: b.service?.name || "Unknown Service",
            notes: b.notes,
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
           if (svcs.length > 0) {
             setBookingItems([{ 
               serviceId: svcs[0].id, 
               staffId: stf.length > 0 ? stf[0].id : "", 
               date: new Date().toISOString().split('T')[0], 
               time: "09:00" 
             }]);
           }
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
    if (!tenant || !formName || bookingItems.length === 0 || isSaving) return;
    
    setIsSaving(true);
    try {
      // Save all bookings in parallel or sequence
      const promises = bookingItems.map(item => {
        const selectedService = services.find(s => s.id === item.serviceId);
        const selectedStaff = staffList.find(s => s.id === item.staffId);
        
        return createBooking({
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
          date: item.date,
          time: item.time,
          status: "Approved",
          notes: formNotes || null,
        });
      });

      const results = await Promise.all(promises);
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        await fetchRealBookings(tenant);
        setShowAddForm(false);
        setFormName("");
        setFormPhone("");
        setCurrentStep(1);
        setBookingItems([{ 
          serviceId: services[0]?.id || "", 
          staffId: staffList[0]?.id || "", 
          date: new Date().toISOString().split('T')[0], 
          time: "09:00" 
        }]);
        setFormNotes("");
      } else {
        alert("Some bookings failed to save.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save booking");
    } finally {
      setIsSaving(false);
    }
  };

  const addBookingItem = () => {
    setBookingItems([...bookingItems, { 
      serviceId: services[0]?.id || "", 
      staffId: staffList[0]?.id || "", 
      date: new Date().toISOString().split('T')[0], 
      time: "09:00" 
    }]);
  };

  const removeBookingItem = (index: number) => {
    if (bookingItems.length === 1) return;
    setBookingItems(bookingItems.filter((_, i) => i !== index));
  };

  const updateBookingItem = (index: number, field: string, value: string) => {
    const newItems = [...bookingItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setBookingItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = bookingItems.reduce((acc, item) => {
      const service = services.find(s => s.id === item.serviceId);
      return acc + (service?.price || 0);
    }, 0);
    return Math.max(0, subtotal - discountAmount);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    // Example: Check for special admin codes
    if (promoCode.toUpperCase() === "VICI20") {
      const subtotal = bookingItems.reduce((acc, item) => {
        const service = services.find(s => s.id === item.serviceId);
        return acc + (service?.price || 0);
      }, 0);
      setDiscountAmount(subtotal * 0.2);
      alert("Promo code VICI20 applied: 20% Discount!");
      return;
    }

    // Check if it's a customer reward from "Spin the Wheel"
    if (formPhone) {
      try {
        const prize = await getUnusedPromotion(tenant.id, formPhone);
        if (prize && prize.prize.includes("%")) {
          const percent = parseInt(prize.prize);
          if (!isNaN(percent)) {
            const subtotal = bookingItems.reduce((acc, item) => {
              const service = services.find(s => s.id === item.serviceId);
              return acc + (service?.price || 0);
            }, 0);
            setDiscountAmount(subtotal * (percent / 100));
            alert(`Customer reward applied: ${prize.prize}!`);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Check database for valid coupons
    try {
      const result = await validateCoupon(tenant.id, promoCode);
      if (result.success) {
        const coupon = result.coupon;
        const subtotal = bookingItems.reduce((acc, item) => {
          const service = services.find(s => s.id === item.serviceId);
          return acc + (service?.price || 0);
        }, 0);
        setDiscountAmount(subtotal * (coupon.discountValue / 100));
        alert(`Coupon ${coupon.code} applied: ${coupon.discountValue}% Discount!`);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    alert("Invalid promo code or no rewards found for this phone number.");
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const upcomingBookings = Object.entries(dbBookings)
    .flatMap(([dayStr, bookings]) => {
      const day = parseInt(dayStr);
      const today = new Date();
      const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
      const isFutureMonth = currentDate.getFullYear() > today.getFullYear() || (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() > today.getMonth());
      
      if (!isCurrentMonth && !isFutureMonth) return [];
      if (isCurrentMonth && day < today.getDate()) return [];
      
      return bookings.map(b => ({
        ...b,
        day,
        dateStr: `${monthNames[currentDate.getMonth()]} ${day}, ${currentDate.getFullYear()}`
      }));
    })
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.time.localeCompare(b.time);
    });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100vh-8rem)] flex flex-col relative">

      {/* TOP SECTION: Calendar (70%) */}
      <div className="flex flex-col h-[70%] border-b border-gray-200 bg-white relative">
        {/* Calendar Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
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
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-xl text-gray-900">
                {currentStep === 1 ? "Add Walk-in Booking" : "Checkout Summary"}
              </h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {currentStep === 1 ? (
                <div className="space-y-8">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea 
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Special requests, allergies, etc." 
                      rows={2}
                      className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none resize-none text-sm" 
                    />
                  </div>

                  {/* Booking Items */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        Services Selection
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{bookingItems.length}</span>
                      </h4>
                    </div>

                    {bookingItems.map((item, idx) => (
                      <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4 relative group">
                        {bookingItems.length > 1 && (
                          <button 
                            onClick={() => removeBookingItem(idx)}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={16} />
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                            <select 
                              value={item.serviceId}
                              onChange={(e) => updateBookingItem(idx, 'serviceId', e.target.value)}
                              className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                            >
                              {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
                            <select 
                              value={item.staffId}
                              onChange={(e) => updateBookingItem(idx, 'staffId', e.target.value)}
                              className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                            >
                              <option value="">Any Available</option>
                              {staffList.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Date</label>
                            <input 
                              type="date" 
                              value={item.date}
                              onChange={(e) => updateBookingItem(idx, 'date', e.target.value)}
                              className="w-full p-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Time</label>
                            <input 
                              type="time" 
                              value={item.time}
                              onChange={(e) => updateBookingItem(idx, 'time', e.target.value)}
                              className="w-full p-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={addBookingItem}
                      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Plus size={18} /> Add Another Service
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <h4 className="font-bold text-gray-900 mb-2">Customer Summary</h4>
                    <p className="text-gray-700 text-sm">Name: <span className="font-semibold">{formName}</span></p>
                    {formPhone && <p className="text-gray-700 text-sm">Phone: <span className="font-semibold">{formPhone}</span></p>}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900">Selected Services</h4>
                    {bookingItems.map((item, idx) => {
                      const service = services.find(s => s.id === item.serviceId);
                      const staff = staffList.find(s => s.id === item.staffId);
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="font-medium text-gray-900">{service?.name}</p>
                            <p className="text-xs text-gray-500">{item.date} at {item.time} • {staff?.name || "Any Staff"}</p>
                          </div>
                          <p className="font-bold text-gray-900">${service?.price || 0}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-gray-200 mt-auto space-y-6">
                    {/* Promo Code Section */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Promo Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="e.g. VICI20" 
                          className="flex-1 p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" 
                        />
                        <button 
                          onClick={handleApplyPromo}
                          className="px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 border-b border-gray-50 pb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900 font-medium">${bookingItems.reduce((acc, item) => acc + (services.find(s => s.id === item.serviceId)?.price || 0), 0)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Discount</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-900 font-bold">Total</span>
                        <span className="text-gray-900 font-bold text-xl">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">

                      <h4 className="font-bold text-gray-900 text-sm">Select Payment Method *</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'cash', label: 'Cash', icon: '💵' },
                          { id: 'credit', label: 'Card', icon: '💳' },
                          { id: 'paypal', label: 'Paypal', icon: '🅿️' }
                        ].map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                              paymentMethod === method.id 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                            }`}
                          >
                            <span className="text-xl">{method.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 sticky bottom-0">
              {currentStep === 1 ? (
                <>
                  <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-white rounded-xl transition-colors border border-gray-200">
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (formName && bookingItems.length > 0) setCurrentStep(2);
                      else alert("Please enter customer name");
                    }}
                    className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors"
                  >
                    Next: Checkout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setCurrentStep(1)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-white rounded-xl transition-colors border border-gray-200">
                    Back
                  </button>
                  <button 
                    onClick={handleSaveBooking}
                    disabled={isSaving || !paymentMethod}
                    className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finish"}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto bg-gray-50/50 p-4 md:p-6">
          <div className="grid grid-cols-7 gap-2 md:gap-4 min-w-[700px] lg:min-w-0 min-h-full">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-500 text-sm py-1 md:py-2">
                {day}
              </div>
            ))}
            
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] md:min-h-[100px] bg-transparent rounded-xl border border-transparent"></div>
            ))}
            
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i: number) => {
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
                  className={`min-h-[80px] md:min-h-[100px] bg-white rounded-xl border ${isToday ? 'border-primary ring-1 ring-primary' : 'border-gray-200'} p-2 md:p-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col`}
                >
                  <div className="flex justify-between items-start mb-1 md:mb-2">
                    <span className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-xs md:text-sm font-medium ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] md:text-xs font-medium text-gray-500">{dayBookings.length} appts</span>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                    {dayBookings.map((b, idx) => (
                      <div key={idx} className="bg-primary/10 border-l-2 border-primary text-primary px-1.5 md:px-2 py-1 md:py-1.5 rounded text-[10px] md:text-xs truncate">
                        <span className="font-semibold">{b.time}</span> {b.customer}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Upcoming Appointments (30%) */}
      <div className="flex flex-col h-[30%] bg-white shrink-0">
        <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm md:text-base">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            Upcoming Appointments
          </h3>
          <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
            {upcomingBookings.length} total
          </span>
        </div>
        <div className="flex-1 overflow-auto p-3 md:p-4 bg-gray-50/30">
          {upcomingBookings.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
              No upcoming appointments for this month.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {upcomingBookings.map((b, i) => (
                <div key={i} className="flex flex-col p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/50 transition-all shadow-sm gap-3 relative overflow-hidden group hover:shadow-md cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                  
                  <div className="flex justify-between items-start pl-1">
                    <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-bold border border-primary/20 shadow-sm">
                      {b.time}
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 text-right line-clamp-1 max-w-[55%]">
                      {b.service}
                    </div>
                  </div>
                  
                  <div className="pl-1 mt-1">
                    <p className="font-bold text-gray-900 text-base line-clamp-1">{b.customer}</p>
                    <div className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-between">
                      <span>{b.dateStr}</span>
                      {b.notes && (
                        <div className="flex items-center gap-1 text-primary bg-primary/5 px-1.5 py-0.5 rounded italic truncate max-w-[100px]" title={b.notes}>
                          📝 {b.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            {b.service}
                            {b.notes && <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded italic">📝 {b.notes}</span>}
                          </p>
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
