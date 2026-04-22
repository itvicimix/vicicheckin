"use client";

import { Plus, User, Clock, CalendarOff, Edit2, Trash2, Search } from "lucide-react";
import { useState } from "react";

export default function StaffPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  const staffList = [
    { id: "1", name: "Sarah Connor", role: "Senior Stylist", status: "Active", bookings: 45 },
    { id: "2", name: "Jessica Smith", role: "Nail Technician", status: "Active", bookings: 32 },
    { id: "3", name: "Michael Johnson", role: "Massage Therapist", status: "On Leave", bookings: 0 },
    { id: "4", name: "Emily Davis", role: "Junior Stylist", status: "Active", bookings: 12 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      
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
              placeholder="Search staff..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add Staff
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Team Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" placeholder="John Doe" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
              <input type="text" placeholder="Senior Technician" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="john@example.com" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" placeholder="(555) 123-4567" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">Cancel</button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors">Save Member</button>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div key={staff.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative">
              
              {/* Action Menu */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{staff.name}</h3>
                  <p className="text-sm text-gray-500">{staff.role}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {staff.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>Schedule</span>
                  </div>
                  <button className="text-primary font-medium hover:underline text-xs">Edit Hours</button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarOff size={16} className="text-gray-400" />
                    <span>Days Off</span>
                  </div>
                  <button className="text-primary font-medium hover:underline text-xs">Manage</button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">This Month</span>
                <span className="text-sm font-bold text-gray-900">{staff.bookings} Bookings</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
