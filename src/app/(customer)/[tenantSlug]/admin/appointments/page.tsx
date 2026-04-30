"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Search, Loader2, Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getBookings, updateBookingStatus } from "@/actions/booking";
import { getTenantBySlug } from "@/actions/tenant";

export default function AppointmentsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [bookings, setBookings] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.customerName?.toLowerCase().includes(q) ||
           b.customerPhone?.includes(q) ||
           b.service?.name?.toLowerCase().includes(q) ||
           b.staff?.name?.toLowerCase().includes(q) ||
           b.id.toLowerCase().includes(q);
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const t = await getTenantBySlug(tenantSlug);
        if (t) {
          setTenant(t);
          const b = await getBookings(t.id);
          // Sort by date descending (newest first)
          const sorted = b.sort((x: any, y: any) => {
            const dateX = new Date(`${x.date} ${x.time}`).getTime();
            const dateY = new Date(`${y.date} ${y.time}`).getTime();
            return dateY - dateX;
          });
          setBookings(sorted);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!tenant) return;
    
    setUpdatingId(id);
    try {
      const result = await updateBookingStatus(id, newStatus, tenant.id);
      if (result.success) {
        // Update local state
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs font-semibold"><AlertCircle size={12}/> Pending</span>;
      case "Approved":
        return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle size={12}/> Approved</span>;
      case "Reject":
      case "Cancel":
      case "Cancelled":
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><XCircle size={12}/> {status}</span>;
      default:
        return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Manage and track all booking statuses.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search appointments..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Desktop Table Content */}
      <div className="flex-1 overflow-auto hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
              <th className="px-6 py-4">ID / Customer</th>
              <th className="px-6 py-4">Service Details</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Current Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              paginatedBookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        {b.customerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate">{b.customerName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={10} /> {b.customerPhone || "N/A"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{b.service?.name || "Unknown Service"}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <User size={12}/> {b.staff?.name || "Any Staff"}
                    </div>
                    {b.notes && (
                      <div className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-md mt-1.5 italic flex items-center gap-1 w-fit" title={b.notes}>
                        📝 {b.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-medium flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {new Date(b.date).toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs mt-1 flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {b.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(b.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      disabled={updatingId === b.id}
                      className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-1.5 outline-none cursor-pointer hover:border-gray-300 disabled:opacity-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Reject">Reject</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Content */}
      <div className="flex-1 overflow-auto md:hidden p-4 space-y-4 bg-gray-50/50">
        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
            No appointments found.
          </div>
        ) : (
          paginatedBookings.map((b) => (
            <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {b.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{b.customerName}</div>
                    <div className="text-xs text-gray-500">{b.customerPhone || "N/A"}</div>
                  </div>
                </div>
                {getStatusBadge(b.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Service</div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">{b.service?.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><User size={10}/> {b.staff?.name}</div>
                  {b.notes && (
                    <div className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded mt-1 italic line-clamp-1" title={b.notes}>
                      📝 {b.notes}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Schedule</div>
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><Calendar size={12}/> {new Date(b.date).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5"><Clock size={12}/> {b.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-gray-500 flex-1">ID: {b.id.substring(0, 8)}</span>
                <select
                  value={b.status}
                  onChange={(e) => handleStatusChange(b.id, e.target.value)}
                  disabled={updatingId === b.id}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 outline-none font-medium"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Reject">Reject</option>
                  <option value="Cancel">Cancel</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 bg-white mt-auto shrink-0 z-10 gap-3">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <div className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-lg border border-gray-100">
              Page {currentPage} of {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
