"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { CheckCircle, Calendar, User, Clock, Scissors, CreditCard, Star, ExternalLink } from "lucide-react";
import { useState } from "react";
import { createBooking } from "@/actions/booking";
import { Gift } from "lucide-react";

export function StepConfirm({ tenant }: { tenant: any }) {
  const state = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPrice = state.selectedServices.reduce((sum, s) => {
    // Basic parsing for price string like "50+" or "50"
    const val = parseInt(s.price.replace(/[^0-9]/g, '')) || 0;
    return sum + val;
  }, 0);

  let promoDiscount = 0;
  if (state.promotionPrize && state.promotionPrize.includes('% Off')) {
    promoDiscount = parseInt(state.promotionPrize.replace('% Off', '')) || 0;
  }
  
  const totalDiscountPercentage = (state.loyaltyStatus?.discountPercentage || 0) + promoDiscount;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    try {
      // Pick the first service to associate with the booking
      const mainService = state.selectedServices[0];
      
      const response = await createBooking({
        tenantId: tenant.id,
        customerName: state.customerInfo.fullName,
        customerPhone: state.customerInfo.phone,
        service: mainService,
        staff: state.selectedStaff,
        date: state.selectedDate ? state.selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: state.selectedTime || "12:00",
        discountPercentage: totalDiscountPercentage,
        promotionPrize: state.promotionPrize,
      });

      if (response.success) {
        setIsSuccess(true);
      } else {
        alert(response.error || "Something went wrong.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          Thank you, {state.customerInfo.fullName}. Your appointment at {tenant.name} is successfully booked. We've sent a confirmation SMS to {state.customerInfo.phone}.
        </p>

        <div className="bg-white border-2 border-yellow-100 shadow-sm w-full max-w-sm rounded-2xl p-6 mb-8 transition-transform hover:-translate-y-1">
          <h3 className="font-bold text-gray-900 mb-2">How was your experience?</h3>
          <p className="text-sm text-gray-500 mb-4">Please support us by leaving a 5-star review on Google Maps. It means the world to us!</p>
          <a 
            href={tenant.googleReviewUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.name + " " + (tenant.location || ""))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center gap-2 group cursor-pointer"
            title="Leave a 5-star review on Google"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="w-10 h-10 text-yellow-400 fill-yellow-400 transform transition-transform group-hover:scale-110 drop-shadow-sm" 
              />
            ))}
          </a>
          <a 
            href={tenant.googleReviewUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.name + " " + (tenant.location || ""))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Write a review <ExternalLink size={14} />
          </a>
        </div>

        <button 
          onClick={() => {
            state.reset();
            // navigate to home or something
          }}
          className="px-8 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-24 w-full">
        <h3 className="font-bold text-2xl text-gray-900 mb-6">Review & Confirm</h3>
        
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
          
          {/* DateTime & Staff */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Calendar className="text-primary mt-0.5" size={20} />
              <div>
                <p className="font-medium text-gray-900">
                  {state.selectedDate?.toDateString()} at {state.selectedTime}
                </p>
                <p className="text-sm text-gray-500">Scheduled Time</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <User className="text-primary mt-0.5" size={20} />
              <div>
                <p className="font-medium text-gray-900">
                  {state.selectedStaff ? state.selectedStaff.name : "Any Available Staff"}
                </p>
                <p className="text-sm text-gray-500">Staff Member</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full" />

          {/* Services */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-500 font-medium text-sm uppercase tracking-wider">
              <Scissors size={16} /> Services
            </div>
            <div className="space-y-3">
              {state.selectedServices.map(s => (
                <div key={s.id} className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">{s.name}</span>
                  <span className="text-gray-900 font-semibold">${s.price}</span>
                </div>
              ))}
            </div>

            {state.loyaltyStatus && state.loyaltyStatus.discountPercentage > 0 && (
              <div className="mt-3 flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg text-sm font-medium">
                <span>Loyalty Discount ({state.loyaltyStatus.tier} - {state.loyaltyStatus.discountPercentage}%)</span>
                <span>- ${(totalPrice * (state.loyaltyStatus.discountPercentage / 100)).toFixed(2)}</span>
              </div>
            )}

            {state.promotionPrize && (
              <div className="mt-3 flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg text-sm font-medium">
                <span className="flex items-center gap-1"><Gift size={14}/> Lucky Wheel Prize</span>
                <span>{state.promotionPrize}</span>
              </div>
            )}

            <div className="mt-4 flex flex-col bg-primary/5 p-4 rounded-xl text-primary gap-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Final Total</span>
                <span className="font-bold text-xl">
                  ${(totalPrice * (1 - totalDiscountPercentage / 100)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-80">
                <span>Points you'll earn</span>
                <span>+ {Math.floor((totalPrice * (1 - totalDiscountPercentage / 100)) / 3)} pts</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full" />

          {/* Customer & Payment */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Customer Details</p>
              <p className="font-medium text-gray-900">{state.customerInfo.fullName}</p>
              <p className="text-gray-600">{state.customerInfo.phone}</p>
              <p className="text-gray-600">Guests: {state.guests}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <CreditCard className="text-gray-400" size={18} />
              <span className="text-gray-700 capitalize">{state.paymentMethod?.replace('_', ' ')}</span>
            </div>
          </div>

        </div>

      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center py-4 rounded-xl bg-accent-1 hover:bg-accent-2 text-white font-semibold text-lg transition-colors shadow-[0_4px_14px_0_rgba(190,34,48,0.39)] max-w-3xl mx-auto disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>
    </div>
  );
}
