"use client";

import { Users, CalendarCheck, TrendingUp, DollarSign, X, CheckSquare, Square, Send, Loader2, RefreshCw, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCustomers } from "@/actions/customer";
import { getBookings, updateBookingStatus } from "@/actions/booking";
import { getTenantBySlug } from "@/actions/tenant";
import { sendSMSPromotion } from "@/actions/sms";

export default function AdminDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const t = await getTenantBySlug(tenantSlug);
        if (t) {
          setTenant(t);
          const [bookings, customers] = await Promise.all([
            getBookings(t.id),
            getCustomers(t.id)
          ]);

          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const upcoming = bookings.filter((b: any) => b.date >= todayStr);
          
          const formattedBookings = upcoming.slice(0, 8).map((b: any) => ({
            id: b.id,
            customer: b.customerName,
            service: b.service?.name || "Service",
            date: b.date,
            time: b.time,
            status: b.status,
            price: `$${b.service?.price || "0"}`,
            notes: b.notes
          }));
          
          setRecentBookings(formattedBookings);
          setCustomersList(customers);
        }
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [tenantSlug]);

  const toggleCustomer = (id: string) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(c => c !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const selectAll = () => {
    if (selectedCustomers.length === customersList.length && customersList.length > 0) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customersList.map(c => c.id));
    }
  };

  const select500 = () => {
    setSelectedCustomers(customersList.slice(0, 500).map(c => c.id));
  };

  const handleSendSMS = async () => {
    if (!smsText.trim() || selectedCustomers.length === 0) return;
    setIsSending(true);

    const phoneNumbers = customersList
      .filter(c => selectedCustomers.includes(c.id) && c.phone)
      .map(c => c.phone);

    if (phoneNumbers.length === 0) {
      alert("No valid phone numbers found for the selected customers.");
      setIsSending(false);
      return;
    }

    try {
      const result = await sendSMSPromotion(smsText, phoneNumbers);
      if (result.success) {
        alert(result.message);
        setShowSmsModal(false);
        setSmsText("");
        setSelectedCustomers([]);
      } else {
        alert("Error sending SMS: " + result.error);
      }
    } catch (error) {
      alert("An unknown error occurred.");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!tenant) return;
    
    setUpdatingId(id);
    try {
      const result = await updateBookingStatus(id, newStatus, tenant.id);
      if (result.success) {
        setRecentBookings(recentBookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleWheel = async () => {
    if (!tenant) return;
    setIsSending(true); // Using isSending as a general loading state here for simplicity
    try {
      const result = await updateLuckyWheel(tenant.id, { enabled: !tenant.luckyWheelEnabled });
      if (result.success) {
        setTenant(result.data);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to update lucky wheel");
    } finally {
      setIsSending(false);
    }
  };

  const stats = [
    { title: "Total Bookings", value: recentBookings.length, trend: "+100%", icon: CalendarCheck },
    { title: "Revenue", value: `$${recentBookings.reduce((acc, b) => acc + parseFloat(b.price.replace('$', '')), 0)}`, trend: "+100%", icon: DollarSign },
    { title: "Total Customers", value: customersList.length, trend: "+100%", icon: Users },
    { title: "Conversion Rate", value: "100%", trend: "0%", icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings List */}
        {/* Upcoming Appointments Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              Upcoming Appointments
            </h2>
            <button 
              onClick={() => router.push(`/${tenantSlug}/admin/calendar`)}
              className="text-sm text-primary font-medium hover:underline"
            >
              View Calendar
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 bg-gray-50/30">
            {recentBookings.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 py-12 italic">
                No upcoming appointments scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/50 transition-all shadow-sm gap-3 relative overflow-hidden group hover:shadow-md">
                    <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                      booking.status === 'Approved' ? 'bg-green-500' : 
                      booking.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    
                    <div className="flex justify-between items-start pl-1">
                      <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold border border-primary/20 shadow-sm">
                        {booking.time}
                      </div>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        disabled={updatingId === booking.id}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer outline-none border transition-colors disabled:opacity-50 ${
                          booking.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                          booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Reject">Reject</option>
                      </select>
                    </div>
                    
                    <div className="pl-1">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="font-bold text-gray-900 text-sm line-clamp-1">{booking.customer}</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">{booking.service}</p>
                        </div>
                        <div className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          {booking.price}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-2 flex items-center justify-between font-medium">
                        <span>📅 {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {booking.notes && (
                          <div className="flex items-center gap-1 text-primary bg-primary/5 px-1.5 py-0.5 rounded italic truncate max-w-[120px]" title={booking.notes}>
                            📝 {booking.notes}
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

        {/* Quick Actions / Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={() => router.push(`/${tenantSlug}/admin/calendar?action=add-booking`)}
              className="w-full p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 bg-accent-1/10 text-accent-1 rounded-lg flex items-center justify-center">
                <CalendarCheck size={20} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Add Walk-in</h4>
                <p className="text-xs text-gray-500">Create booking manually</p>
              </div>
            </button>
            <button 
              onClick={() => setShowSmsModal(true)}
              className="w-full p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Send SMS Promo</h4>
                <p className="text-xs text-gray-500">Broadcast to customers</p>
              </div>
            </button>
          </div>

          {/* Lucky Wheel Status Card */}
          <div className={`mt-6 p-6 rounded-2xl border transition-all ${
            tenant?.luckyWheelEnabled 
            ? "bg-orange-50 border-orange-100 shadow-sm shadow-orange-100" 
            : "bg-gray-50 border-gray-100 opacity-80"
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                tenant?.luckyWheelEnabled ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                <RefreshCw size={24} className={tenant?.luckyWheelEnabled ? "animate-spin-slow" : ""} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push(`/${tenantSlug}/admin/promotions`)}
                  className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors border border-gray-200 px-2 py-1 rounded-md"
                >
                  Config
                </button>
                <button 
                  onClick={handleToggleWheel}
                  disabled={isSending}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                    tenant?.luckyWheelEnabled 
                    ? "bg-red-100 text-red-600 hover:bg-red-200" 
                    : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isSending ? "..." : tenant?.luckyWheelEnabled ? "OFF" : "ON"}
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                Lucky Wheel
                {tenant?.luckyWheelEnabled && (
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                )}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Status: <span className={tenant?.luckyWheelEnabled ? "text-green-600 font-bold" : "text-gray-400 font-bold"}>
                  {tenant?.luckyWheelEnabled ? "ACTIVE" : "INACTIVE"}
                </span>
              </p>
              
              {tenant?.luckyWheelEnabled && (
                <div className="mt-4 flex items-center gap-2 text-xs text-orange-700 bg-white/50 p-2 rounded-lg">
                  <Gift size={14} />
                  <span>Cửa hàng đang có chương trình quay thưởng cho khách mới!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const trendStr = stat.trend.toString();
          const isPositive = trendStr.startsWith("+");
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${isPositive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* SMS Promo Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Send SMS Promotion</h3>
                <p className="text-sm text-gray-500">Broadcast marketing texts directly to clients.</p>
              </div>
              <button 
                onClick={() => setShowSmsModal(false)} 
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                <textarea 
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="e.g. Special offer! Get 20% off all Nails services this weekend..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary outline-none resize-none text-sm"
                />
                <div className="text-right mt-1 text-xs text-gray-400">
                  {smsText.length} / 300 characters
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Select Recipients</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={select500}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Select 500
                    </button>
                    <button 
                      onClick={selectAll}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {selectedCustomers.length === customersList.length && customersList.length > 0 ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                  {customersList.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No customers found</div>
                  ) : (
                    customersList.map((customer) => {
                      const isSelected = selectedCustomers.includes(customer.id);
                      return (
                        <div 
                          key={customer.id} 
                          onClick={() => toggleCustomer(customer.id)}
                          className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="text-primary">
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-gray-300" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setShowSmsModal(false)} 
                className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendSMS}
                disabled={isSending || smsText.trim() === "" || selectedCustomers.length === 0}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    Send ({selectedCustomers.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
