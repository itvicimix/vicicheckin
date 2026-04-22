"use client";

import { Staff, useBookingStore } from "@/store/useBookingStore";
import { User, Check } from "lucide-react";

const mockStaff: Staff[] = [
  { id: "any", name: "Any Available" },
  { id: "staff1", name: "Sarah" },
  { id: "staff2", name: "Jessica" },
  { id: "staff3", name: "Michael" },
];

export function StepStaff() {
  const { selectedStaff, setStaff, nextStep } = useBookingStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pb-24">
        {mockStaff.map((staff) => {
          const isSelected = selectedStaff?.id === staff.id || (staff.id === "any" && selectedStaff === null);
          return (
            <div
              key={staff.id}
              onClick={() => setStaff(staff.id === "any" ? null : staff)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
                <User size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-lg">{staff.name}</h3>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                }`}
              >
                {isSelected && <Check size={14} />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t">
        <button
          onClick={nextStep}
          className="w-full py-4 rounded-xl bg-accent-1 hover:bg-accent-2 text-white font-semibold text-lg transition-colors shadow-[0_4px_14px_0_rgba(190,34,48,0.39)]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
