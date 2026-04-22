"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { useState } from "react";

export function StepInfo() {
  const { customerInfo, setCustomerInfo, nextStep } = useBookingStore();
  const [localInfo, setLocalInfo] = useState(customerInfo);

  const isValid = localInfo.fullName.trim().length > 0 && localInfo.phone.trim().length > 0;

  const handleContinue = () => {
    if (isValid) {
      setCustomerInfo(localInfo);
      nextStep();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-24 max-w-md mx-auto w-full">
        
        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={localInfo.fullName}
              onChange={(e) => setLocalInfo({ ...localInfo, fullName: e.target.value })}
              placeholder="e.g., Jane Doe"
              className="w-full p-4 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={localInfo.phone}
              onChange={(e) => setLocalInfo({ ...localInfo, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full p-4 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
            <textarea
              value={localInfo.notes || ""}
              onChange={(e) => setLocalInfo({ ...localInfo, notes: e.target.value })}
              placeholder="Any special requests or allergies?"
              rows={4}
              className="w-full p-4 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            />
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t">
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full py-4 rounded-xl bg-accent-1 hover:bg-accent-2 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(190,34,48,0.39)] max-w-3xl mx-auto block"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
