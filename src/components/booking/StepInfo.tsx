"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { useState } from "react";
import { checkCustomerLoyalty } from "@/actions/loyalty";
import { getUnusedPromotion } from "@/actions/promotion";
import { Loader2, Award, Gift } from "lucide-react";

export function StepInfo({ tenant }: { tenant: any }) {
  const { customerInfo, setCustomerInfo, nextStep, setLoyaltyStatus, loyaltyStatus, setPromotionPrize, promotionPrize } = useBookingStore();
  const [localInfo, setLocalInfo] = useState(customerInfo);
  const [isCheckingLoyalty, setIsCheckingLoyalty] = useState(false);

  const isValid = localInfo.fullName.trim().length > 0 && localInfo.phone.trim().length > 0;

  const handlePhoneBlur = async () => {
    if (localInfo.phone.trim().length < 10) return;
    
    setIsCheckingLoyalty(true);
    try {
      const loyalty = await checkCustomerLoyalty(tenant.id, localInfo.phone);
      if (loyalty) {
        setLoyaltyStatus({
          tier: loyalty.tier,
          points: loyalty.points,
          discountPercentage: loyalty.discountPercentage
        });
        
        // Auto fill name if empty
        if (!localInfo.fullName) {
          setLocalInfo(prev => ({ ...prev, fullName: loyalty.name }));
        }
      } else {
        setLoyaltyStatus(null);
      }

      const promotion = await getUnusedPromotion(tenant.id, localInfo.phone);
      if (promotion) {
        setPromotionPrize(promotion.prize);
      } else {
        setPromotionPrize(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCheckingLoyalty(false);
    }
  };

  const handleContinue = () => {
    if (isValid) {
      setCustomerInfo(localInfo);
      nextStep();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-24 max-w-md mx-auto w-full">
        
        {loyaltyStatus && loyaltyStatus.tier !== "None" && (
          <div className="mt-4 p-4 rounded-xl border border-yellow-200 bg-yellow-50 flex gap-4 items-start shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
              <Award className="text-yellow-600" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-yellow-900">Welcome Back, {localInfo.fullName || "VIP"}!</h4>
              <p className="text-sm text-yellow-800 mt-1">
                You have <strong>{loyaltyStatus.points}</strong> points ({loyaltyStatus.tier} Tier).
                You will get <strong>{loyaltyStatus.discountPercentage}% off</strong> this booking!
              </p>
            </div>
          </div>
        )}

        {promotionPrize && (
          <div className="mt-4 p-4 rounded-xl border border-green-200 bg-green-50 flex gap-4 items-start shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <Gift className="text-green-600" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-green-900">🎁 Lucky Reward!</h4>
              <p className="text-sm text-green-800 mt-1">
                You won <strong>{promotionPrize}</strong> from our Lucky Wheel! It will be applied to this booking.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <div className="relative">
              <input
                type="tel"
                value={localInfo.phone}
                onChange={(e) => setLocalInfo({ ...localInfo, phone: e.target.value })}
                onBlur={handlePhoneBlur}
                placeholder="(555) 123-4567"
                className="w-full p-4 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              {isCheckingLoyalty && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-primary w-5 h-5" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter your phone number to check loyalty points.</p>
          </div>

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
          disabled={!isValid || isCheckingLoyalty}
          className="w-full py-4 rounded-xl bg-accent-1 hover:bg-accent-2 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(190,34,48,0.39)] max-w-3xl mx-auto block flex justify-center items-center gap-2"
        >
          {isCheckingLoyalty && <Loader2 className="animate-spin w-5 h-5" />}
          Continue
        </button>
      </div>
    </div>
  );
}
