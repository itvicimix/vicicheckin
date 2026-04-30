"use client";

import { useState, useEffect } from "react";
import { Service, useBookingStore } from "@/store/useBookingStore";
import { Clock, Check, Loader2 } from "lucide-react";
import { getServices } from "@/actions/service";

export function StepService({ tenant }: { tenant: any }) {
  const { selectedServices, toggleService, nextStep } = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!tenant) return;
      try {
        const data = await getServices(tenant.id);
        setServices(data.map((s: any) => ({
          id: s.id,
          name: s.name,
          duration: parseInt(s.duration) || 60,
          price: s.price.toString(),
          category: s.category || "General",
        })));
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, [tenant]);

  const isSelected = (id: string) => selectedServices.some((s) => s.id === id);

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const cat = service.category || "General";
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pb-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-500 font-medium">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-8 pb-24">
        {Object.entries(groupedServices).map(([category, catServices]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-3 border-l-4 border-primary bg-gray-50/50 py-1 rounded-r-lg">
              {category}
            </h3>
            <div className="space-y-3">
              {catServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => toggleService(service)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected(service.id)
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-100 hover:border-gray-300 bg-white"
                  } flex justify-between items-center`}
                >
                  <div>
                    <h3 className="font-medium text-gray-900 text-lg">{service.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                      <Clock size={14} />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">${service.price}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isSelected(service.id) ? "bg-primary border-primary text-white" : "border-gray-300"
                      }`}
                    >
                      {isSelected(service.id) && <Check size={14} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No services available at the moment.
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t">
        <button
          onClick={nextStep}
          disabled={selectedServices.length === 0}
          className="w-full py-4 rounded-xl bg-accent-1 hover:bg-accent-2 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(190,34,48,0.39)]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
