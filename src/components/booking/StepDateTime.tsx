"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { useState } from "react";

const generateDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
};

export function StepDateTime({ tenant }: { tenant: any }) {
  const { selectedDate, selectedTime, setDateTime, nextStep } = useBookingStore();
  
  const [localDate, setLocalDate] = useState<Date | null>(selectedDate || new Date());
  const [localTime, setLocalTime] = useState<string | null>(selectedTime);

  const days = generateDays();

  // Dynamic time slot generation
  const slotInterval = tenant?.slotInterval || 30;
  const minLeadTime = tenant?.minLeadTime || 60;

  const timeSlots = (() => {
    if (!localDate) return [];
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 20;  // 8 PM
    const now = new Date();
    
    // Threshold for minimum lead time
    const threshold = new Date(now.getTime() + minLeadTime * 60000);

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotInterval) {
        const slotDate = new Date(localDate);
        slotDate.setHours(h, m, 0, 0);

        if (slotDate > threshold) {
          const timeStr = slotDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          });
          slots.push(timeStr);
        }
      }
    }
    return slots;
  })();

  const handleContinue = () => {
    if (localDate && localTime) {
      setDateTime(localDate, localTime);
      nextStep();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* Date Picker */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-3">Select Date</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((date, i) => {
              const isSelected = localDate?.toDateString() === date.toDateString();
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              
              return (
                <div
                  key={i}
                  onClick={() => {
                    setLocalDate(date);
                    setLocalTime(null);
                  }}
                  className={`min-w-[80px] cursor-pointer rounded-2xl p-3 flex flex-col items-center justify-center border-2 transition-colors ${
                    isSelected ? "border-primary bg-primary text-white" : "border-gray-100 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className={`text-xs ${isSelected ? "text-white/80" : "text-gray-500"}`}>{month}</span>
                  <span className="text-xl font-bold my-1">{dayNum}</span>
                  <span className={`text-xs uppercase font-medium ${isSelected ? "text-white" : "text-gray-700"}`}>{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Picker */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Select Time</h3>
          {timeSlots.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No slots available for this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((time) => {
                const isSelected = localTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => setLocalTime(time)}
                    className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-colors ${
                      isSelected ? "border-primary bg-primary/10 text-primary" : "border-gray-100 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t">
        <button
          onClick={handleContinue}
          disabled={!localDate || !localTime}
          className="w-full py-4 rounded-xl bg-accent-1 hover:bg-accent-2 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(190,34,48,0.39)]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
