"use client";

import { Users, CalendarCheck, TrendingUp, DollarSign, X, CheckSquare, Square, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const stats = [
    { title: "Total Bookings", value: "145", trend: "+12%", icon: CalendarCheck },
    { title: "Revenue", value: "$4,250", trend: "+8%", icon: DollarSign },
    { title: "New Customers", value: "32", trend: "+24%", icon: Users },
    { title: "Conversion Rate", value: "68%", trend: "-2%", icon: TrendingUp },
  ];

  // Danh sách khách hàng mẫu (trong thực tế sẽ load từ DB)
  const customersList = [
    { id: "c1", name: "Alice Johnson", phone: "(555) 123-4567" },
    { id: "c2", name: "Emily Davis", phone: "(555) 987-6543" },
    { id: "c3", name: "Michael Smith", phone: "(555) 456-7890" },
    { id: "c4", name: "Sarah Wilson", phone: "(555) 222-3333" },
    { id: "c5", name: "John Doe", phone: "(555) 888-9999" },
  ];

  useEffect(() => {
    const defaultBookings = [
      { id: "1", customer: "Alice Johnson", service: "Spa Pedicure", date: "Today at 2:00 PM", status: "Confirmed", price: "$50" },
      { id: "2", customer: "Michael Smith", service: "Relaxing Head Spa", date: "Today at 3:30 PM", status: "Pending", price: "$80" },
      { id: "3", customer: "Emily Davis", service: "Classic Manicure", date: "Tomorrow at 10:00 AM", status: "Confirmed", price: "$35" },
    ];
    
    try {
      const stored = localStorage.getItem('recentBookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentBookings([...parsed, ...defaultBookings]);
      } else {
        setRecentBookings(defaultBookings);
      }
    } catch (e) {
      setRecentBookings(defaultBookings);
    }
  }, []);

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
    // Giả lập gửi SMS API
    setTimeout(() => {
      setIsSending(false);
      setShowSmsModal(false);
      setSmsText("");
      setSelectedCustomers([]);
      alert(`Successfully sent SMS promotion to ${selectedCustomers.length} customers!`);
    }, 1500);
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith("+");
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
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
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
                {recentBookings.map((booking) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/admin/calendar?action=add-booking')}
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
                  {customersList.map((customer) => {
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
                  })}
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
