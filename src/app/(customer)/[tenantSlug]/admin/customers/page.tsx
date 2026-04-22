"use client";

import { useState } from "react";
import { Search, MoreVertical, Edit2, History, Star, Plus } from "lucide-react";

export default function CustomersPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  const customers = [
    { id: "c1", name: "Alice Johnson", phone: "(555) 123-4567", email: "alice@example.com", visits: 12, spent: "$650", lastVisit: "2 days ago", vip: true },
    { id: "c2", name: "Emily Davis", phone: "(555) 987-6543", email: "emily.d@example.com", visits: 4, spent: "$180", lastVisit: "1 week ago", vip: false },
    { id: "c3", name: "Michael Smith", phone: "(555) 456-7890", email: "msmith@example.com", visits: 1, spent: "$80", lastVisit: "Today", vip: false },
    { id: "c4", name: "Sarah Wilson", phone: "(555) 222-3333", email: "sarahw@example.com", visits: 24, spent: "$1,250", lastVisit: "1 month ago", vip: true },
    { id: "c5", name: "John Doe", phone: "(555) 888-9999", email: "john.doe@example.com", visits: 2, spent: "$70", lastVisit: "3 weeks ago", vip: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your clients, view their history and spending.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors whitespace-nowrap">
            Export CSV
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add Customer
          </button>
        </div>
      </div>

      {/* Add Customer Inline Form */}
      {showAddForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Customer</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" placeholder="e.g., Jane Smith" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input type="tel" placeholder="(555) 000-0000" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" placeholder="jane@example.com" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-transparent hover:bg-gray-100 rounded-lg transition-colors">
                <div className="relative flex items-center">
                  <input type="checkbox" className="w-5 h-5 accent-yellow-400 rounded cursor-pointer" />
                </div>
                <div className="flex items-center gap-1.5 font-medium text-gray-700 select-none">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  Mark as VIP
                </div>
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">Cancel</button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors">Save Customer</button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr className="text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-semibold">Customer Details</th>
              <th className="px-6 py-4 font-semibold">Contact Info</th>
              <th className="px-6 py-4 font-semibold text-center">Total Visits</th>
              <th className="px-6 py-4 font-semibold">Total Spent</th>
              <th className="px-6 py-4 font-semibold">Last Visit</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {c.name}
                        {c.vip && <Star size={14} className="text-yellow-400 fill-yellow-400" />}
                      </div>
                      <div className="text-xs text-gray-500">ID: #{c.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{c.phone}</div>
                  <div className="text-gray-500">{c.email}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block bg-gray-100 text-gray-800 font-bold px-2 py-1 rounded-md text-xs">
                    {c.visits}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-green-700">{c.spent}</td>
                <td className="px-6 py-4 text-gray-600">{c.lastVisit}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View History">
                      <History size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit Customer">
                      <Edit2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
