"use client";

import { Mail, Save, Loader2, Server, Send, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { getSystemSettings, updateSMTPSettings } from "@/actions/settings";
import { sendCustomEmail } from "@/actions/email";

export default function EmailConfigPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [smtpProvider, setSmtpProvider] = useState("other");
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState("admin@vicitemplate.com");
  const [smtpPass, setSmtpPass] = useState("Mix12:33");
  const [smtpFrom, setSmtpFrom] = useState("admin@vicitemplate.com");

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getSystemSettings();
      if (settings) {
        if (settings.smtpProvider) setSmtpProvider(settings.smtpProvider);
        if (settings.smtpHost) setSmtpHost(settings.smtpHost);
        if (settings.smtpPort) setSmtpPort(settings.smtpPort);
        if (settings.smtpUser) setSmtpUser(settings.smtpUser);
        if (settings.smtpPass) setSmtpPass(settings.smtpPass);
        if (settings.smtpFrom) setSmtpFrom(settings.smtpFrom);
      }
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSaveCredentials = async () => {
    setIsSaving(true);
    const result = await updateSMTPSettings({
      smtpProvider,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFrom,
    });
    setIsSaving(false);
    
    if (result.success) {
      alert("SMTP configuration saved successfully!");
      setIsEditing(false);
    } else {
      alert("Error saving configuration: " + result.error);
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
        <h2 className="text-2xl font-bold">Email Configuration</h2>
        <p className="text-gray-400 text-sm mt-1">Configure SMTP settings to send emails from the system.</p>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <Mail className="text-blue-400" />
          <h3 className="text-lg font-semibold">SMTP Credentials</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Provider</label>
            <select
              value={smtpProvider}
              onChange={(e) => setSmtpProvider(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
              disabled={!isEditing}
            >
              <option value="other">Other SMTP</option>
              <option value="gmail">Gmail</option>
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">SMTP Host</label>
            <input 
              type="text" 
              value={smtpHost} 
              onChange={(e) => setSmtpHost(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono text-sm" 
              readOnly={!isEditing} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">SMTP Port</label>
            <input 
              type="number" 
              value={smtpPort} 
              onChange={(e) => setSmtpPort(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono text-sm" 
              readOnly={!isEditing} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">SMTP Username</label>
            <input 
              type="text" 
              value={smtpUser} 
              onChange={(e) => setSmtpUser(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono text-sm" 
              readOnly={!isEditing} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">SMTP Password</label>
            <input 
              type="password" 
              value={smtpPass} 
              onChange={(e) => setSmtpPass(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono text-sm" 
              readOnly={!isEditing} 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">From Email</label>
            <input 
              type="text" 
              value={smtpFrom} 
              onChange={(e) => setSmtpFrom(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono text-sm" 
              readOnly={!isEditing} 
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <EditIcon /> Edit Credentials
              </button>
            ) : (
              <button 
                onClick={handleSaveCredentials}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                Save Credentials
              </button>
            )}
          </div>
        </div>
      </div>

      <CustomEmailSection />

    </div>
  );
}


function CustomEmailSection() {
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    setTestResult(null);

    const formData = new FormData(e.currentTarget);
    
    // We are passing formData directly to the server action
    const result = await sendCustomEmail(formData);
    
    if (result.success) {
      setTestResult({ success: true, message: `Email sent successfully! Message ID: ${result.messageId}` });
      (e.target as HTMLFormElement).reset(); // Reset the form after success
    } else {
      setTestResult({ success: false, message: `Failed to send: ${result.error}` });
    }
    
    setIsSending(false);
  };

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-sm overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-700 flex items-center gap-3">
        <Send className="text-blue-400" />
        <h3 className="text-lg font-semibold">Send Custom Email</h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">To Email <span className="text-red-400">*</span></label>
              <input 
                type="email" 
                name="toEmail"
                required
                placeholder="recipient@example.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">From Name</label>
              <input 
                type="text" 
                name="fromName"
                defaultValue="Admin"
                placeholder="e.g. Admin, Support, John Doe"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Subject <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              name="subject"
              required
              placeholder="Email Subject"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm" 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Title (Heading in Email)</label>
            <input 
              type="text" 
              name="title"
              placeholder="Large heading inside the email body..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm" 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description (Body)</label>
            <textarea 
              name="description"
              rows={5}
              placeholder="Write your email content here..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none text-sm resize-y" 
            ></textarea>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Attachment (Optional)</label>
            <div className="flex items-center gap-2">
              <Paperclip size={18} className="text-gray-500" />
              <input 
                type="file" 
                name="file"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
              Send Email
            </button>
          </div>
        </form>
        
        {testResult && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${testResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  );
}
