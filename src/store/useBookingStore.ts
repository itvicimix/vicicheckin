import { create } from 'zustand';

export type Service = {
  id: string;
  name: string;
  duration: number;
  price: string;
};

export type Staff = {
  id: string;
  name: string;
  avatarUrl?: string;
};

interface BookingState {
  step: number;
  selectedServices: Service[];
  selectedStaff: Staff | null; // null means 'Any'
  selectedDate: Date | null;
  selectedTime: string | null;
  guests: number;
  customerInfo: {
    fullName: string;
    phone: string;
    notes?: string;
  };
  paymentMethod: 'in_store' | 'credit_card' | 'paypal' | null;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  toggleService: (service: Service) => void;
  setStaff: (staff: Staff | null) => void;
  setDateTime: (date: Date, time: string) => void;
  setGuests: (count: number) => void;
  setCustomerInfo: (info: { fullName: string; phone: string; notes?: string }) => void;
  setPaymentMethod: (method: 'in_store' | 'credit_card' | 'paypal') => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  selectedServices: [],
  selectedStaff: null,
  selectedDate: null,
  selectedTime: null,
  guests: 1,
  customerInfo: { fullName: '', phone: '' },
  paymentMethod: null,

  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  setStep: (step) => set({ step }),
  toggleService: (service) =>
    set((state) => {
      const exists = state.selectedServices.find((s) => s.id === service.id);
      if (exists) {
        return { selectedServices: state.selectedServices.filter((s) => s.id !== service.id) };
      }
      return { selectedServices: [...state.selectedServices, service] };
    }),
  setStaff: (staff) => set({ selectedStaff: staff }),
  setDateTime: (date, time) => set({ selectedDate: date, selectedTime: time }),
  setGuests: (guests) => set({ guests }),
  setCustomerInfo: (info) => set({ customerInfo: info }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  reset: () =>
    set({
      step: 1,
      selectedServices: [],
      selectedStaff: null,
      selectedDate: null,
      selectedTime: null,
      guests: 1,
      customerInfo: { fullName: '', phone: '' },
      paymentMethod: null,
    }),
}));
