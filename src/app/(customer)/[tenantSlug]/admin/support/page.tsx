"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, Send, User, ShieldCheck, Loader2 } from "lucide-react";
import { getTenantBySlug } from "@/actions/tenant";
import { getSupportMessages, sendSupportMessage, markSupportMessagesRead } from "@/actions/support";

export default function SupportPage() {
  const { tenantSlug } = useParams() as { tenantSlug: string };
  const [tenant, setTenant] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const t = await getTenantBySlug(tenantSlug);
        if (t) {
          setTenant(t);
          const res = await getSupportMessages(t.id);
          if (res.success) setMessages(res.data || []);
          await markSupportMessagesRead(t.id, "ADMIN");
        }
      } catch (err) {
        console.error("Support page data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [tenantSlug]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !tenant?.id || isSending) return;

    setIsSending(true);
    try {
      const res = await sendSupportMessage(tenant.id, "ADMIN", newMessage);
      if (res.success) {
        setMessages(prev => [...prev, res.data]);
        setNewMessage("");
      } else {
        alert("Failed to send: " + res.error);
      }
    } catch (err) {
      alert("Error sending message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-600 text-center">
        <h3 className="font-bold">Error Loading Support</h3>
        <p className="text-sm mt-1">We couldn't identify your business account. Please refresh or try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Support & Feedback</h2>
              <p className="text-xs text-gray-500">Chat directly with Super Admin for help and suggestions.</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-gray-900 font-semibold">No messages yet</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
                Found a bug? Need a new feature? Send a message to our Super Admin team.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === "ADMIN";
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden ${isMe ? "bg-primary text-white" : "bg-zinc-800 text-white"}`}>
                      {isMe ? (
                        tenant?.logo ? <img src={tenant.logo} className="w-full h-full object-cover" /> : <User size={14} />
                      ) : <ShieldCheck size={14} />}
                    </div>
                    <div className="flex flex-col">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMe 
                          ? "bg-primary text-white rounded-tr-none shadow-md shadow-primary/10" 
                          : "bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message to Super Admin..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-xl disabled:opacity-50 transition-all shadow-md shadow-primary/20"
            >
              {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
