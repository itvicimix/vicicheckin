"use client";

import { Service, useBookingStore } from "@/store/useBookingStore";
import { Clock, Check } from "lucide-react";

const mockServices: Service[] = [
  { id: "s1", name: "Classic Manicure", duration: 45, price: "35" },
  { id: "s2", name: "Spa Pedicure", duration: 60, price: "50" },
  { id: "s3", name: "Gel Polish Change", duration: 30, price: "25" },
  { id: "s4", name: "Acrylic Full Set", duration: 90, price: "65+" },
  { id: "s5", name: "Relaxing Head Spa", duration: 60, price: "80" },
];

export function StepService() {
  const { selectedServices, toggleService, nextStep } = useBookingStore();

  const isSelected = (id: string) => selectedServices.some((s) => s.id === id);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pb-24">
        {mockServices.map((service) => (
          <div
            key={service.id}
            onClick={() => toggleService(service)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isSelected(service.id)
                ? "border-primary bg-primary/5"
                : "border-gray-100 hover:border-gray-300"
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
