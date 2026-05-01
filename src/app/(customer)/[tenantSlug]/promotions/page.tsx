"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTenantBySlug } from "@/actions/tenant";
import { checkEligibility, claimPromotion } from "@/actions/promotion";
import { LuckyWheel } from "@/components/promotions/LuckyWheel";
import { Loader2, Phone, ArrowRight, AlertCircle, Gift } from "lucide-react";
import { ChatbotWidget } from "@/components/common/ChatbotWidget";

export default function PromotionsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;

  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Phone Step
  const [phone, setPhone] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const fetchTenant = async () => {
      const t = await getTenantBySlug(tenantSlug);
      if (t) setTenant(t);
      setIsLoading(false);
    };
    fetchTenant();
  }, [tenantSlug]);

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setIsChecking(true);
    const result = await checkEligibility(tenant.id, phone);
    
    if (result.eligible) {
      setIsEligible(true);
      // Save phone to localStorage for booking flow pre-fill
      localStorage.setItem("customer_phone", phone);
    } else {
      if (result.reason === "already_customer") {
        setError("Sorry! This phone number has already been used for booking and is not eligible for the new customer promotion.");
      } else if (result.reason === "already_spun") {
        setError("You have already used your spin!");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
    setIsChecking(false);
  };

  const handleSpin = async () => {
    const result = await claimPromotion(tenant.id, phone);
    if (result.success && result.prize) {
      return result.prize;
    } else {
      setError(result.error || "Cannot spin the wheel");
      return null;
    }
  };

  const handleFinish = (prize: string) => {
    // Redirect to booking page
    setTimeout(() => {
      router.push(`/${tenant.slug}`);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!tenant || !tenant.luckyWheelEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">The promotion has ended</h2>
        <p className="text-gray-500 max-w-md">Sorry, there are no ongoing promotions at the moment. Please check back later!</p>
        <button 
          onClick={() => router.push(`/${tenantSlug}`)}
          className="mt-6 text-primary font-bold hover:underline"
        >
          Back to homepage
        </button>
      </div>
    );
  }

  return (
    <main 
      className="min-h-screen bg-gray-50 relative flex flex-col items-center justify-center p-4 overflow-hidden"
      style={tenant.themeColor ? { '--color-primary': tenant.themeColor } as React.CSSProperties : undefined}
    >
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative z-10 p-8 sm:p-12 text-center">
        
        {/* Salon Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl overflow-hidden ring-4 ring-primary/20 bg-white">
            {tenant.logo ? (
              <img src={tenant.logo} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-primary">{tenant.name.charAt(0)}</span>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2">Lucky Wheel</h1>
        <p className="text-slate-500 mb-8">Exclusive for new customers of <strong className="text-primary">{tenant.name}</strong></p>

        {!isEligible ? (
          <form onSubmit={handleCheckEligibility} className="space-y-4 max-w-sm mx-auto">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-sm text-slate-700 mb-6 flex flex-col items-center">
              <Gift className="w-8 h-8 text-primary mb-2" />
              <span>Enter your phone number to check eligibility and get instant gifts or discounts!</span>
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="tel"
                placeholder="Your phone number..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-medium"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm justify-center bg-red-50 py-2 px-4 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isChecking || !phone}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              Continue
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-50 text-green-700 font-medium py-2 px-4 rounded-full inline-block mb-4 text-sm">
              ✨ Congratulations! You are eligible to spin.
            </div>
            <LuckyWheel 
              onSpin={handleSpin} 
              onFinish={handleFinish} 
              color={tenant.themeColor || "#724677"} 
              prizes={tenant.luckyWheelConfig ? JSON.parse(tenant.luckyWheelConfig).map((p: any) => p.label) : []}
            />
            
            {error && (
              <div className="mt-4 text-red-500 text-sm">{error}</div>
            )}
          </div>
        )}
      </div>

      <ChatbotWidget tenant={tenant} />
    </main>
  );
}
