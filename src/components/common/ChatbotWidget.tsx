"use client";

import { MessageSquare, X, Send } from "lucide-react";
import { useState, useEffect } from "react";

interface ChatbotWidgetProps {
  tenant: any;
}

export function ChatbotWidget({ tenant }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (tenant?.chatbotConfig) {
      try {
        setConfig(JSON.parse(tenant.chatbotConfig));
      } catch (e) {
        console.error("Failed to parse chatbot config", e);
      }
    }
  }, [tenant]);

  if (!tenant?.chatbotEnabled || !config) return null;

  const handleOpenBot = () => {
    if (config.type === 'whatsapp') {
      const phone = config.value.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(config.welcomeMessage || "Hi!")}`;
      window.open(url, '_blank');
    } else if (config.type === 'messenger') {
      const url = `https://m.me/${config.value}`;
      window.open(url, '_blank');
    } else if (config.type === 'script') {
      // If it's a script, maybe we just open it in a new tab or if it's an ID we could load it
      if (config.value.startsWith('http')) {
        window.open(config.value, '_blank');
      } else {
        setIsOpen(!isOpen);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Welcome Bubble */}
      {isOpen && config.type === 'script' && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-primary text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span className="font-bold text-sm">Chat with us</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <X size={18} />
            </button>
          </div>
          <div className="p-6 text-center space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              {config.welcomeMessage}
            </p>
            <button 
              onClick={() => {
                if (config.value.startsWith('http')) window.open(config.value, '_blank');
              }}
              className="w-full py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md"
            >
              Start Chat
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleOpenBot}
        className="w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 relative group"
        title="Chat with us"
      >
        <MessageSquare size={28} />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          How can we help?
        </span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
      </button>
    </div>
  );
}
