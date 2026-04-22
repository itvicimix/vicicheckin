"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { Store, CreditCard, Wallet } from "lucide-react";

export function StepPayment() {
  const { paymentMethod, setPaymentMethod, nextStep } = useBookingStore();

  const methods = [
    { id: "in_store", name: "Pay in Store", icon: Store, description: "Pay when you arrive or finish the service." },
    { id: "credit_card", name: "Credit Card", icon: CreditCard, description: "Secure online payment." },
    { id: "paypal", name: "PayPal", icon: Wallet, description: "Fast and safe via PayPal." },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-24 max-w-md mx-auto w-full mt-4 space-y-4">
        
        {methods.map((method) => {
          const isSelected = paymentMethod === method.id;
          const Icon = method.icon;

          return (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-gray-100 hover:border-gray-300 bg-white"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{method.name}</h3>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-gray-300">
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </div>
          );
        })}

      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t">
        <button
          onClick={nextStep}
          disabled={!paymentMethod}
          className="w-full py-4 rounded-xl bg-accent-1 hover:bg-accent-2 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(190,34,48,0.39)] max-w-3xl mx-auto block"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
