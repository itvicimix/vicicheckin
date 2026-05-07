"use client";

import { useLanguageStore } from "@/store/useLanguageStore";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 relative rounded-full transition-colors focus:outline-none flex items-center justify-center gap-1.5 ${
          isDarkMode ? "text-zinc-400 hover:bg-zinc-900" : "text-gray-500 hover:bg-gray-100"
        }`}
        title="Change Language"
      >
        <Globe size={18} />
        <span className="text-xs font-bold uppercase">{language}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute top-full right-0 mt-2 w-36 rounded-xl shadow-2xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"
          }`}
        >
          <div className="py-1">
            <button
              onClick={() => {
                setLanguage("en");
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                language === "en"
                  ? isDarkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                  : isDarkMode ? "text-zinc-300 hover:bg-zinc-800" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              English (EN)
            </button>
            <button
              onClick={() => {
                setLanguage("vi");
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                language === "vi"
                  ? isDarkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                  : isDarkMode ? "text-zinc-300 hover:bg-zinc-800" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Tiếng Việt (VI)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
