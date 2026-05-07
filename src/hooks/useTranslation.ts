"use client";

import { useLanguageStore } from "@/store/useLanguageStore";
import { en } from "@/locales/en";
import { vi } from "@/locales/vi";

const dictionaries = {
  en,
  vi,
};

type Dictionary = typeof en;

export function useTranslation() {
  const { language } = useLanguageStore();
  const dict = dictionaries[language] || en;

  // Simple key-based getter
  // E.g., t("wizard.step")
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = dict;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  return { t, language };
}
