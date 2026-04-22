"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { StepService } from "./StepService";
import { StepStaff } from "./StepStaff";
import { StepDateTime } from "./StepDateTime";
import { StepGuests } from "./StepGuests";
import { StepInfo } from "./StepInfo";
import { StepPayment } from "./StepPayment";
import { StepConfirm } from "./StepConfirm";

export function BookingWizard({ tenant }: { tenant: any }) {
  const { step, prevStep } = useBookingStore();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepService key="step1" />;
      case 2:
        return <StepStaff key="step2" />;
      case 3:
        return <StepDateTime key="step3" />;
      case 4:
        return <StepGuests key="step4" />;
      case 5:
        return <StepInfo key="step5" />;
      case 6:
        return <StepPayment key="step6" />;
      case 7:
        return <StepConfirm key="step7" tenant={tenant} />;
      default:
        return <StepService key="step1" />;
    }
  };

  const stepsTitle = [
    "Select Service",
    "Select Staff",
    "Select Date & Time",
    "Guests",
    "Your Information",
    "Payment Method",
    "Confirmation",
  ];

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Header Wizard */}
      <div className="px-6 py-4 border-b flex items-center gap-4 bg-gray-50/50">
        <button
          onClick={prevStep}
          disabled={step === 1 || step === 7}
          className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
            (step === 1 || step === 7) ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-primary font-medium tracking-wider uppercase mb-1">
            Step {step} of 7
          </p>
          <h2 className="text-xl font-semibold text-gray-900">{stepsTitle[step - 1]}</h2>
        </div>
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-x-hidden p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full flex flex-col"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
