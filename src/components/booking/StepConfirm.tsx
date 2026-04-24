"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { CheckCircle, Calendar, User, Clock, Scissors, CreditCard, Star, ExternalLink, Share2, MapPin } from "lucide-react";
import { useState } from "react";
import { createBooking } from "@/actions/booking";
import { Gift, Tag, Loader2 } from "lucide-react";
import { validateCoupon } from "@/actions/coupon";

export function StepConfirm({ tenant }: { tenant: any }) {
  const state = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const totalPrice = state.selectedServices.reduce((sum, s) => {
    // Basic parsing for price string like "50+" or "50"
    const val = parseInt(s.price.replace(/[^0-9]/g, '')) || 0;
    return sum + val;
  }, 0);

  let promoDiscount = 0;
  if (state.promotionPrize) {
    const match = state.promotionPrize.match(/(\d+)\s*%/);
    if (match) {
      promoDiscount = parseInt(match[1]) || 0;
    }
  }
  
  const totalDiscountPercentage = (state.loyaltyStatus?.discountPercentage || 0) + promoDiscount + state.couponDiscount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidating(true);
    try {
      const result = await validateCoupon(tenant.id, promoCode);
      if (result.success && result.coupon) {
        state.setCouponDiscount(result.coupon.discountValue);
        alert(`Success! ${result.coupon.name} applied: ${result.coupon.discountValue}% off.`);
      } else {
        alert(result.error || "Mã giảm giá không hợp lệ");
        state.setCouponDiscount(0);
      }
    } catch (err) {
      alert("Failed to validate coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    try {
      // Pick the first service to associate with the booking
      const mainService = state.selectedServices[0];
      
      const fullPhone = `${state.customerInfo.countryCode}${state.customerInfo.phone.replace(/^0+/, '')}`;
      
      const response = await createBooking({
        tenantId: tenant.id,
        customerName: state.customerInfo.fullName,
        customerPhone: fullPhone,
        service: mainService,
        staff: state.selectedStaff,
        date: state.selectedDate ? state.selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: state.selectedTime || "12:00",
        discountPercentage: totalDiscountPercentage,
        promotionPrize: state.promotionPrize,
        notes: state.customerInfo.notes || null,
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
          Thank you, {state.customerInfo.fullName}. Your appointment at {tenant.name} is successfully booked. We've sent a confirmation SMS to {state.customerInfo.countryCode} {state.customerInfo.phone}.
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
 
          {/* Social Links */}
          {(() => {
            let social: any = { facebook: "", instagram: "", tiktok: "", yelp: "", googleMaps: "" };
            try {
              if (tenant?.socialLinks) {
                const parsed = typeof tenant.socialLinks === 'string' ? JSON.parse(tenant.socialLinks) : tenant.socialLinks;
                social = { ...social, ...parsed };
              }
            } catch (e) {
              console.error("Error parsing social links:", e);
            }
            
            const hasSocial = Object.values(social).some(link => !!link);
            if (!hasSocial) return null;

            return (
              <div className="mt-6 pt-6 border-t border-gray-100 w-full">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Follow us on Social</p>
                <div className="flex justify-center gap-4">
                  {social.facebook && (
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all shadow-sm hover:scale-110">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                  )}
                  {social.instagram && (
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-sm hover:scale-110">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  )}
                  {social.tiktok && (
                    <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-zinc-900 transition-all shadow-sm hover:scale-110">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.29-.2-.56-.41-.82-.64V15c0 2.22-.54 4.41-1.89 6.09-1.4 1.74-3.66 2.8-5.87 2.89-2.58.12-5.18-1.07-6.75-3.13-1.42-1.86-1.92-4.32-1.38-6.62.51-2.18 2.05-4.13 4.1-5.06 1.05-.48 2.19-.72 3.34-.73v4.03c-.64.03-1.28.21-1.84.51-.95.53-1.63 1.55-1.74 2.64-.17 1.64.91 3.29 2.5 3.65.65.15 1.34.12 1.96-.08.97-.31 1.72-1.12 1.98-2.09.07-.27.1-.55.1-.83V.02z" />
                      </svg>
                    </a>
                  )}
                  {social.yelp && (
                    <a href={social.yelp} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#d32323] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-sm hover:scale-110">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.167 15.352c-.105-.125-.13-.238-.075-.337.054-.099.146-.143.275-.13l3.651.464c.264.033.433.141.504.321.072.181.042.4-.088.656-.239.467-1.011 1.83-2.316 4.09l-.497.865c-.078.138-.172.232-.283.284-.111.052-.224.054-.338.006-.011-.005-.038-.016-.081-.035a.861.861 0 0 1-.161-.1c-.139-.111-.194-.251-.163-.42.062-.331.393-2.576.993-5.735l.079-.429zm-1.879-2.072c-.156.04-.265.021-.326-.059-.061-.079-.059-.176.005-.291l1.83-3.212c.132-.232.288-.344.47-.333.181.01.378.136.59.378.384.441 1.487 1.761 3.308 3.96l.696.843c.11.134.161.267.151.399-.01.133-.069.24-.176.324l-.105.074c-.06.035-.11.053-.153.053-.178 0-.324-.124-.438-.37l-1.921-4.04-3.931 2.673zm-.124 2.127l.427.086c3.155.632 5.396 1.139 5.725 1.518.034.039.056.096.065.172.01.178-.052.327-.184.447l-.104.095c-.06.054-.124.08-.19.08s-.142-.04-.229-.119l-.821-.74c-2.195-1.98-3.536-3.23-4.02-3.754-.226-.245-.333-.448-.32-.61.012-.162.112-.303.3-.422l.371-.253zm-.269-3.328l-3.664-.326c-.266-.024-.447-.113-.541-.269-.094-.156-.1-.362-.016-.62.15-.46 1.009-1.956 2.578-4.489.155-.251.272-.375.352-.375.024 0 .052.012.083.036l.245.195c.16.14.225.292.195.454l-.59 3.082 1.358 2.312zm1.684.286c-.005.155-.078.258-.22.31s-.273.003-.393-.146l-2.072-2.585c-.15-.187-.208-.344-.175-.47.034-.126.136-.263.305-.41.306-.266 1.25-.972 2.833-2.12l.62-.449c.1-.073.187-.112.262-.119.075-.006.146.012.213.055.024.016.052.039.083.07.132.133.158.283.08.452l-1.54 3.412z" />
                      </svg>
                    </a>
                  )}
                  {social.googleMaps && (
                    <a href={social.googleMaps} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-all shadow-sm hover:scale-110">
                      <MapPin size={24} />
                    </a>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
        <button 
          onClick={() => {
            state.reset();
          }}
          className="px-8 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
        >
          Book Another
        </button>

        {tenant?.luckyWheelEnabled && (
          <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border border-orange-100 shadow-sm w-full max-w-sm animate-pulse-slow">
            <div className="flex items-center gap-3 mb-3 justify-center">
              <Gift className="text-orange-500" size={24} />
              <h4 className="font-bold text-gray-900">May mắn đang chờ bạn!</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Bạn là khách hàng mới? Quay ngay vòng quay may mắn để nhận thêm voucher giảm giá cho lần hẹn tới!</p>
            <button 
              onClick={() => window.location.href = `/${tenant.slug}/promotions`}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md shadow-orange-200"
            >
              Thử vận may ngay!
            </button>
          </div>
        )}
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

            {/* Promo Code Input */}
            <div className="mt-6 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Do you have a promo code?</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-medium"
                  />
                </div>
                <button 
                  onClick={handleApplyPromo}
                  disabled={isValidating}
                  className="px-6 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-50"
                >
                  {isValidating ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col bg-primary/5 p-4 rounded-xl text-primary gap-2">
              <div className="flex justify-between items-center text-sm opacity-70">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              
              {state.loyaltyStatus && state.loyaltyStatus.discountPercentage > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-green-600">
                  <span>Loyalty Discount ({state.loyaltyStatus.discountPercentage}%)</span>
                  <span>-${(totalPrice * (state.loyaltyStatus.discountPercentage / 100)).toFixed(2)}</span>
                </div>
              )}

              {state.couponDiscount > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-green-600">
                  <span>Promo Discount ({state.couponDiscount}%)</span>
                  <span>-${(totalPrice * (state.couponDiscount / 100)).toFixed(2)}</span>
                </div>
              )}
              
              {promoDiscount > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-green-600">
                  <span>Lucky Wheel ({promoDiscount}%)</span>
                  <span>-${(totalPrice * (promoDiscount / 100)).toFixed(2)}</span>
                </div>
              )}

              <div className="h-px bg-primary/10 my-1" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Final Total</span>
                <span className="font-bold text-2xl">
                  ${(totalPrice * (1 - totalDiscountPercentage / 100)).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs opacity-60 mt-1">
                <span className="flex items-center gap-1"><Star size={10} fill="currentColor"/> Points to earn</span>
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
              <p className="text-gray-600">{state.customerInfo.countryCode} {state.customerInfo.phone}</p>
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
