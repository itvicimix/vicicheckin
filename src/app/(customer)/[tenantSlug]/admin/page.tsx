"use client";

import { Users, CalendarCheck, TrendingUp, DollarSign, X, CheckSquare, Square, Send, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCustomers } from "@/actions/customer";
import { getBookings } from "@/actions/booking";
import { getTenantBySlug } from "@/actions/tenant";

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
          
          // Format bookings for display
          const formattedBookings = bookings.slice(0, 5).map(b => ({
            id: b.id,
            customer: b.customerName,
            service: b.service?.name || "Service",
            date: `${new Date(b.date).toLocaleDateString()} at ${b.time}`,
            status: b.status,
            price: `$${b.service?.price || "0"}`
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
    if (selectedCustomers.length === customersList.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customersList.map(c => c.id));
    }
  };

  const handleSendSMS = () => {
    if (!smsText.trim() || selectedCustomers.length === 0) return;
    setIsSending(true);
    // Simulate SMS API
    setTimeout(() => {
      setIsSending(false);
      setShowSmsModal(false);
      setSmsText("");
      setSelectedCustomers([]);
      alert(`Successfully sent SMS promotion to ${selectedCustomers.length} customers!`);
    }, 1500);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <button 
              onClick={() => router.push(`/${tenantSlug}/admin/calendar`)}
              className="text-sm text-primary font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm">
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No recent bookings</td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{booking.customer}</td>
                      <td className="px-6 py-4 text-gray-600">{booking.service}</td>
                      <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{booking.price}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        </div>
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
              
              {/* Message Input */}
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
                  {smsText.length} / 160 characters
                </div>
              </div>

              {/* Select Customers */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Select Recipients</label>
                  <button 
                    onClick={selectAll}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {selectedCustomers.length === customersList.length ? "Deselect All" : "Select All"}
                  </button>
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
