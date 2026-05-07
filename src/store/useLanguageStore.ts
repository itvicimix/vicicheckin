import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "vi";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en", // Default to English
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "language-storage", // name of the item in the storage (must be unique)
    }
  )
);
