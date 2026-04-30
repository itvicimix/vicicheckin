"use client";

import { MessageSquare, X, Send } from "lucide-react";
import { useState, useEffect } from "react";

interface ChatbotWidgetProps {
  tenant: any;
}

export function ChatbotWidget({ tenant }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'bot'|'user', text: string}[]>([]);

  useEffect(() => {
    if (tenant?.chatbotConfig) {
      try {
        setConfig(JSON.parse(tenant.chatbotConfig));
      } catch (e) {
        console.error("Failed to parse chatbot config", e);
      }
    }
  }, [tenant]);

  useEffect(() => {
    if (isOpen && config && chatHistory.length === 0) {
      setChatHistory([{ role: 'bot', text: config.welcomeMessage || "Xin chào! Chúng tôi có thể giúp gì cho bạn hôm nay?" }]);
    }
  }, [isOpen, config]);

  if (!tenant?.chatbotEnabled || !config) return null;

  const defaultFaq = [
    { q: "Tôi muốn đặt lịch hẹn", a: "Dạ vâng, bạn có thể ấn nút 'Start Live Chat' ở dưới để gặp nhân viên hỗ trợ, hoặc đặt trực tiếp qua giao diện web nhé!" },
    { q: "Xin báo giá dịch vụ", a: "Bảng giá dịch vụ tùy thuộc vào yêu cầu cụ thể. Bạn vui lòng chat trực tiếp để được tư vấn chi tiết hơn." },
    { q: "Giờ mở cửa của tiệm", a: "Chúng tôi mở cửa từ 9:00 Sáng đến 8:00 Tối mỗi ngày." },
    { q: "Vị trí tiệm ở đâu?", a: "Vui lòng kéo xuống cuối trang web hoặc click vào nút Chat để nhận vị trí chính xác." },
    { q: "Tôi cần tư vấn thêm", a: "Dạ vâng, bạn vui lòng ấn nút 'Start Live Chat' bên dưới để nhân viên của chúng tôi hỗ trợ bạn ngay lập tức!" }
  ];

  const faq = config.faq || defaultFaq;

  const handleOpenBot = () => {
    setIsOpen(!isOpen);
  };

  const handleQuestionClick = (item: any) => {
    setChatHistory(prev => [
      ...prev,
      { role: 'user', text: item.q },
      { role: 'bot', text: item.a }
    ]);
    
    // Auto scroll to bottom
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-history-container');
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  };

  const handleStartLiveChat = () => {
    if (config.type === 'whatsapp') {
      const phone = config.value.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${phone}`;
      window.open(url, '_blank');
    } else if (config.type === 'messenger') {
      const url = `https://m.me/${config.value}`;
      window.open(url, '_blank');
    } else if (config.type === 'script') {
      if (config.value.startsWith('http')) {
        window.open(config.value, '_blank');
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Welcome Bubble */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-primary text-white flex justify-between items-center shadow-md z-10 relative">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span className="font-bold text-sm">{tenant.name || "Chat with us"}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <X size={18} />
            </button>
          </div>
          
          <div id="chat-history-container" className="p-5 space-y-4 max-h-[350px] overflow-y-auto bg-gray-50/50 flex-col flex scroll-smooth">
            {/* Chat History */}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* FAQ Buttons */}
            <div className="space-y-2 pt-2 flex flex-col items-end">
              {faq.map((item: any, idx: number) => item.q?.trim() !== "" ? (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(item)}
                  className="w-[90%] text-left p-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded-2xl rounded-tr-sm transition-colors group flex items-start justify-between gap-2"
                >
                  <span className="text-sm text-gray-800 group-hover:text-primary transition-colors leading-tight">
                    {item.q}
                  </span>
                  <Send size={14} className="text-primary/50 group-hover:text-primary shrink-0 mt-0.5" />
                </button>
              ) : null)}
            </div>
          </div>
          
          <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
             <button 
                onClick={handleStartLiveChat}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                Start Live Chat
              </button>
             <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center block mt-1">Powered by Antigravity</span>
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
