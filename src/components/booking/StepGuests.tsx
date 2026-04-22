"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { Users, Plus, Minus } from "lucide-react";

export function StepGuests() {
  const { guests, setGuests, nextStep, setStep } = useBookingStore();

  const handleIncrement = () => setGuests(Math.min(guests + 1, 10));
  const handleDecrement = () => setGuests(Math.max(guests - 1, 1));

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm pb-24">
        
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8">
          <Users size={40} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">How many people?</h2>
        <p className="text-gray-500 text-center mb-8">
          Are you booking for just yourself or bringing friends along?
        </p>

        <div className="flex items-center justify-between w-full p-4 rounded-2xl border-2 border-gray-100 mb-8">
          <button 
            onClick={handleDecrement}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <Minus size={20} />
          </button>
          
          <span className="text-4xl font-bold text-gray-900">{guests}</span>
          
          <button 
            onClick={handleIncrement}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {guests > 1 && (
          <div className="w-full bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
            If you need different services for each person, please add services in step 1 or leave a note later.
          </div>
        )}

        {/* Add more service button */}
        <button
          onClick={() => setStep(1)}
          className="text-primary font-medium hover:underline flex items-center gap-2"
        >
          <Plus size={16} /> Add more services
        </button>

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
