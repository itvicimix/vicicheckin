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
  const { selectedDate, selectedTime, setDateTime, nextStep, selectedStaff } = useBookingStore();
  
  const [localDate, setLocalDate] = useState<Date | null>(selectedDate || new Date());
  const [localTime, setLocalTime] = useState<string | null>(selectedTime);

  const days = generateDays();

  // Parse configurations
  const workingHours = typeof tenant?.workingHours === 'string' ? JSON.parse(tenant.workingHours) : tenant?.workingHours || {};
  const holidays = typeof tenant?.holidays === 'string' ? JSON.parse(tenant.holidays) : tenant?.holidays || [];
  const staffTimeOff = selectedStaff?.timeOffDates || [];

  // Dynamic time slot generation
  const slotInterval = tenant?.slotInterval || 30;
  const minLeadTime = tenant?.minLeadTime || 60;

  const timeSlots = (() => {
    if (!localDate) return [];
    const slots = [];
    
    // Get day name (Monday, Tuesday, etc.)
    const dayName = localDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayConfig = workingHours[dayName];
    
    // Check if salon is closed or it's a holiday
    const dateStr = localDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD (approximate)
    // A better way to get local YYYY-MM-DD
    const offsetDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
    const localDateStr = offsetDate.toISOString().split('T')[0];

    if (holidays.includes(localDateStr)) return [];
    if (staffTimeOff.includes(localDateStr)) return [];
    if (dayConfig && dayConfig.isOpen === false) return [];

    let startHour = 8;
    let endHour = 20;
    let startMin = 0;
    let endMin = 0;

    if (dayConfig && dayConfig.openTime) {
      const [h, m] = dayConfig.openTime.split(':');
      startHour = parseInt(h);
      startMin = parseInt(m);
    }
    if (dayConfig && dayConfig.closeTime) {
      const [h, m] = dayConfig.closeTime.split(':');
      endHour = parseInt(h);
      endMin = parseInt(m);
    }

    const now = new Date();
    const threshold = new Date(now.getTime() + minLeadTime * 60000);

    // Generate slots
    const startMins = startHour * 60 + startMin;
    const endMins = endHour * 60 + endMin;

    for (let m = startMins; m < endMins; m += slotInterval) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      
      const slotDate = new Date(localDate);
      slotDate.setHours(h, min, 0, 0);

      if (slotDate > threshold) {
        const timeStr = slotDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
        slots.push(timeStr);
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
              const dayNameShort = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNameLong = date.toLocaleDateString('en-US', { weekday: 'long' });
              const dayNum = date.getDate();
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              
              // Check if disabled
              const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
              const dateStr = offsetDate.toISOString().split('T')[0];
              const isHoliday = holidays.includes(dateStr);
              const isStaffOff = staffTimeOff.includes(dateStr);
              const dayConfig = workingHours[dayNameLong];
              const isClosed = dayConfig && dayConfig.isOpen === false;
              
              const isDisabled = isHoliday || isStaffOff || isClosed;
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!isDisabled) {
                      setLocalDate(date);
                      setLocalTime(null);
                    }
                  }}
                  disabled={isDisabled}
                  className={`min-w-[80px] rounded-2xl p-3 flex flex-col items-center justify-center border-2 transition-colors ${
                    isDisabled ? "opacity-50 bg-gray-50 border-gray-100 cursor-not-allowed" :
                    isSelected ? "border-primary bg-primary text-white cursor-pointer" : "border-gray-100 hover:border-gray-300 bg-white cursor-pointer"
                  }`}
                >
                  <span className={`text-xs ${isSelected ? "text-white/80" : "text-gray-500"}`}>{month}</span>
                  <span className={`text-xl font-bold my-1 ${isDisabled ? "text-gray-400" : ""}`}>{dayNum}</span>
                  <span className={`text-xs uppercase font-medium ${isSelected ? "text-white" : "text-gray-700"}`}>{dayNameShort}</span>
                  {isDisabled && <span className="text-[10px] text-red-500 mt-1 font-bold">{isClosed ? "Closed" : "Off"}</span>}
                </button>
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
