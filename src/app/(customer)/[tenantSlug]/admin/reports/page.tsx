"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, DollarSign, Users, TrendingUp, Award } from "lucide-react";
import { getRevenueReport, getNewCustomersReport, getPopularServicesReport } from "@/actions/report";
import { getTenantBySlug } from "@/actions/tenant";

export default function ReportsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [revenue, setRevenue] = useState({ weekly: 0, monthly: 0 });
  const [newCustomers, setNewCustomers] = useState(0);
  const [popularServices, setPopularServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const tenant = await getTenantBySlug(tenantSlug);
        if (tenant) {
          const [revenueRes, customersRes, servicesRes] = await Promise.all([
            getRevenueReport(tenant.id),
            getNewCustomersReport(tenant.id),
            getPopularServicesReport(tenant.id)
          ]);

          if (revenueRes.success) {
            setRevenue({ weekly: revenueRes.weeklyRevenue, monthly: revenueRes.monthlyRevenue });
          }
          if (customersRes.success) {
            setNewCustomers(customersRes.newCustomers);
          }
          if (servicesRes.success) {
            setPopularServices(servicesRes.popularServices);
          }
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [tenantSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-y-auto h-[calc(100vh-8rem)]">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Overview of your business performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Doanh thu tuần */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:border-primary/30 transition-all group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Revenue (This Week)</p>
          <h3 className="text-3xl font-bold text-gray-900">${revenue.weekly.toFixed(2)}</h3>
        </div>

        {/* Doanh thu tháng */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:border-primary/30 transition-all group">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Revenue (This Month)</p>
          <h3 className="text-3xl font-bold text-gray-900">${revenue.monthly.toFixed(2)}</h3>
        </div>

        {/* Khách hàng mới */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:border-primary/30 transition-all group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">New Customers (This Month)</p>
          <h3 className="text-3xl font-bold text-gray-900">{newCustomers}</h3>
        </div>
      </div>

      {/* Dịch vụ phổ biến */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-primary" size={20} />
            Most Popular Services
          </h3>
        </div>
        <div className="p-0">
          {popularServices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No service data available yet.</div>
          ) : (
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white">
                  <tr className="text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 whitespace-nowrap">Service Name</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Bookings Count</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {popularServices.map((service, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3 whitespace-nowrap">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-700">
                        {service.count}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-green-600">
                        ${service.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
