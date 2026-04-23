"use client";

import { MessageSquareQuote, KeyRound, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSystemSettings, updateTwilioSettings } from "@/actions/settings";

export default function SMSConfigPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [twilioSid, setTwilioSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getSystemSettings();
      if (settings) {
        setTwilioSid(settings.twilioSid || "");
        setTwilioAuthToken(settings.twilioAuthToken || "");
        setTwilioPhone(settings.twilioPhone || "");
      }
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSaveCredentials = async () => {
    setIsSaving(true);
    const result = await updateTwilioSettings({
      twilioSid,
      twilioAuthToken,
      twilioPhone,
    });
    setIsSaving(false);
    
    if (result.success) {
      alert("Đã lưu cấu hình Twilio thành công!");
      setIsEditing(false);
    } else {
      alert("Lỗi khi lưu cấu hình: " + result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-100 max-w-5xl">
      
      <div>
        <h2 className="text-2xl font-bold">SMS & Twilio Configuration</h2>
        <p className="text-gray-400 text-sm mt-1">Configure global Twilio API keys and dynamic SMS templates for all tenants.</p>
      </div>

      {/* API Key Config */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <KeyRound className="text-blue-400" />
          <h3 className="text-lg font-semibold">Twilio Credentials</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Account SID</label>
            <input 
              type="text" 
              value={twilioSid} 
              onChange={(e) => setTwilioSid(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono text-sm" 
              readOnly={!isEditing} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Auth Token</label>
            <input 
              type="password" 
              value={twilioAuthToken} 
              onChange={(e) => setTwilioAuthToken(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono text-sm" 
              readOnly={!isEditing} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">From Phone Number</label>
            <input 
              type="text" 
              value={twilioPhone} 
              onChange={(e) => setTwilioPhone(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono text-sm" 
              readOnly={!isEditing} 
            />
          </div>
          <div className="flex items-end">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors w-full flex justify-center gap-2"
              >
                <EditIcon /> Edit Credentials
              </button>
            ) : (
              <button 
                onClick={handleSaveCredentials}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors w-full flex justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                Save Credentials
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SMS Templates */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <MessageSquareQuote className="text-blue-400" />
          <h3 className="text-lg font-semibold">Global SMS Templates</h3>
        </div>
        
        <div className="p-6 space-y-6">
          
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
            <h4 className="font-medium text-blue-400 mb-2">Available Variables</h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-400">
              <span className="bg-gray-800 px-2 py-1 rounded">%customer_full_name%</span>
              <span className="bg-gray-800 px-2 py-1 rounded">%service_name%</span>
              <span className="bg-gray-800 px-2 py-1 rounded">%appointment_start_time%</span>
              <span className="bg-gray-800 px-2 py-1 rounded">%tenant_name%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Customer Confirmation Template</label>
            <textarea 
              rows={3} 
              defaultValue="Hello %customer_full_name%, your booking for %service_name% at %tenant_name% is confirmed for %appointment_start_time%. Thank you!"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Owner Notification Template</label>
            <textarea 
              rows={2} 
              defaultValue="New booking: %customer_full_name% booked %service_name% on %appointment_start_time%."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Save size={18} /> Save Templates
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  );
}
