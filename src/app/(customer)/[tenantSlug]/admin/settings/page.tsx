"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Settings, Save, Clock, Calendar, MapPin, Phone, Palette, Loader2, CheckCircle, DollarSign, Share2, MessageSquare } from "lucide-react";
import { getTenantBySlug, updateTenantSettings } from "@/actions/tenant";

export default function SettingsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    location: "",
    phone: "",
    slotInterval: "30",
    minLeadTime: "60",
    themeColor: "#000000",
    logo: "",
    googleReviewUrl: "",
    paymentConfig: {
      creditCard: { apiKey: "", merchantId: "" },
      paypal: { clientId: "", secret: "" },
      localPay: { phoneNumber: "", accountName: "" }
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      tiktok: "",
      yelp: "",
      googleMaps: ""
    },
    chatbotEnabled: false,
    chatbotConfig: {
      type: "whatsapp", // whatsapp, messenger, script
      value: "",
      welcomeMessage: "Hi there! How can we help you today?",
      faq: [
        { q: "Tôi muốn đặt lịch hẹn", a: "Dạ vâng, bạn có thể ấn nút 'Start Chat' ở dưới để gặp nhân viên hỗ trợ, hoặc đặt trực tiếp qua giao diện web nhé!" },
        { q: "Xin báo giá dịch vụ", a: "Bảng giá dịch vụ tùy thuộc vào yêu cầu cụ thể. Bạn vui lòng chat trực tiếp để được tư vấn chi tiết hơn." },
        { q: "Giờ mở cửa của tiệm", a: "Chúng tôi mở cửa từ 9:00 Sáng đến 8:00 Tối mỗi ngày." },
        { q: "Vị trí tiệm ở đâu?", a: "Vui lòng kéo xuống cuối trang web hoặc click vào nút Chat để nhận vị trí chính xác." },
        { q: "Tôi cần tư vấn thêm", a: "Dạ vâng, bạn vui lòng ấn nút 'Start Chat' bên dưới để nhân viên của chúng tôi hỗ trợ bạn ngay lập tức!" }
      ]
    },
    adminEmail: "",
    adminPassword: "",
    itPassword: ""
  });

  const [enabledPayments, setEnabledPayments] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const t = await getTenantBySlug(tenantSlug);
      if (t) {
        setTenant(t);
        
        // Parse payments list
        let payments: string[] = [];
        try {
          payments = t.payments ? JSON.parse(t.payments) : [];
        } catch (e) {
          payments = t.payments ? t.payments.split(',') : [];
        }
        setEnabledPayments(payments);

        // Parse config
        let config = {
          creditCard: { apiKey: "", merchantId: "" },
          paypal: { clientId: "", secret: "" },
          localPay: { phoneNumber: "", accountName: "" }
        };
        if (t.paymentConfig) {
          try {
            config = { ...config, ...JSON.parse(t.paymentConfig) };
          } catch (e) {}
        }

          const parsedConfig = t.chatbotConfig ? JSON.parse(t.chatbotConfig) : {};
          setFormData({
            name: t.name || "",
            location: t.location || "",
            phone: t.phone || "",
            slotInterval: t.slotInterval?.toString() || "30",
            minLeadTime: t.minLeadTime?.toString() || "60",
            themeColor: t.themeColor || "#000000",
            logo: t.logo || "",
            googleReviewUrl: t.googleReviewUrl || "",
            paymentConfig: config,
            socialLinks: t.socialLinks ? JSON.parse(t.socialLinks) : {
              facebook: "",
              instagram: "",
              tiktok: "",
              yelp: "",
              googleMaps: ""
            },
            chatbotEnabled: t.chatbotEnabled || false,
            chatbotConfig: {
              type: parsedConfig.type || "whatsapp",
              value: parsedConfig.value || "",
              welcomeMessage: parsedConfig.welcomeMessage || "Hi there! How can we help you today?",
              faq: parsedConfig.faq || [
                { q: "Tôi muốn đặt lịch hẹn", a: "Dạ vâng, bạn có thể ấn nút 'Start Chat' ở dưới để gặp nhân viên hỗ trợ, hoặc đặt trực tiếp qua giao diện web nhé!" },
                { q: "Xin báo giá dịch vụ", a: "Bảng giá dịch vụ tùy thuộc vào yêu cầu cụ thể. Bạn vui lòng chat trực tiếp để được tư vấn chi tiết hơn." },
                { q: "Giờ mở cửa của tiệm", a: "Chúng tôi mở cửa từ 9:00 Sáng đến 8:00 Tối mỗi ngày." },
                { q: "Vị trí tiệm ở đâu?", a: "Vui lòng kéo xuống cuối trang web hoặc click vào nút Chat để nhận vị trí chính xác." },
                { q: "Tôi cần tư vấn thêm", a: "Dạ vâng, bạn vui lòng ấn nút 'Start Chat' bên dưới để nhân viên của chúng tôi hỗ trợ bạn ngay lập tức!" }
              ]
            },
            adminEmail: t.adminEmail || "",
            adminPassword: t.adminPassword || "",
            itPassword: t.itPassword || ""
          });
      }
      setIsLoading(false);
    };
    fetchData();
  }, [tenantSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const result = await updateTenantSettings(tenant.id, formData);
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (method: string, field: string, value: string) => {
    setFormData({
      ...formData,
      paymentConfig: {
        ...formData.paymentConfig,
        [method]: {
          ...formData.paymentConfig[method],
          [field]: value
        }
      }
    });
  };

  const handleChatbotConfigChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      chatbotConfig: {
        ...formData.chatbotConfig,
        [field]: value
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Salon Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Configure your business details, booking rules, and chatbot.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          <button 
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            General
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Payments
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("social")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'social' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Social
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("chatbot")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'chatbot' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Chatbot
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "general" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Business Info Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-2 text-gray-900 font-bold">
                <Settings size={20} className="text-primary" />
                General Information
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Settings size={16} /> Salon Name
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Palette size={16} /> Brand Color
                  </label>
                  <div className="flex gap-3">
                    <input 
                      type="color" 
                      value={formData.themeColor}
                      onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                      className="w-12 h-10 p-0 rounded-lg border border-gray-200 cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={formData.themeColor}
                      onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                      className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none font-mono text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Palette size={16} /> Business Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="h-16 w-16 object-contain rounded-lg border border-gray-200" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs border border-gray-200">No Logo</div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} /> Address / Location
                  </label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., 123 Beauty St, Los Angeles, CA"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone size={16} /> Business Phone
                  </label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 000-0000"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" 
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} /> Google Map Review Link
                  </label>
                  <input 
                    type="url" 
                    value={formData.googleReviewUrl}
                    onChange={(e) => setFormData({...formData, googleReviewUrl: e.target.value})}
                    placeholder="e.g., https://share.google/..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" 
                  />
                  <p className="text-xs text-gray-500 italic">This link will be used in the step 7 booking confirmation page for customer reviews.</p>
                </div>
              </div>
            </div>

            {/* Booking Rules Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-2 text-gray-900 font-bold">
                <Calendar size={20} className="text-primary" />
                Booking Rules
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock size={16} /> Time Slot Interval
                  </label>
                  <select 
                    value={formData.slotInterval}
                    onChange={(e) => setFormData({...formData, slotInterval: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
                  >
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="45">Every 45 minutes</option>
                    <option value="60">Every 1 hour</option>
                  </select>
                  <p className="text-xs text-gray-500 italic">Distance between available booking times.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock size={16} /> Minimum Lead Time
                  </label>
                  <select 
                    value={formData.minLeadTime}
                    onChange={(e) => setFormData({...formData, minLeadTime: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
                  >
                    <option value="0">No minimum</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="120">2 hours before</option>
                    <option value="1440">1 day before</option>
                  </select>
                  <p className="text-xs text-gray-500 italic">How far in advance customers must book.</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "social" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Social Media Links Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-2 text-gray-900 font-bold">
                <Share2 size={20} className="text-primary" />
                Social Media & Maps
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Share2 size={16} className="text-blue-600" /> Facebook Page URL
                    </label>
                    <input 
                      type="url" 
                      value={formData.socialLinks.facebook}
                      onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, facebook: e.target.value}})}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Share2 size={16} className="text-pink-600" /> Instagram Profile URL
                    </label>
                    <input 
                      type="url" 
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})}
                      placeholder="https://instagram.com/yourprofile"
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Share2 size={16} className="text-black" /> TikTok URL
                    </label>
                    <input 
                      type="url" 
                      value={formData.socialLinks.tiktok}
                      onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, tiktok: e.target.value}})}
                      placeholder="https://tiktok.com/@youraccount"
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Share2 size={16} className="text-red-600" /> Yelp Business URL
                    </label>
                    <input 
                      type="url" 
                      value={formData.socialLinks.yelp}
                      onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, yelp: e.target.value}})}
                      placeholder="https://yelp.com/biz/yourbusiness"
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin size={16} className="text-green-600" /> Google Maps Location URL
                    </label>
                    <input 
                      type="url" 
                      value={formData.socialLinks.googleMaps}
                      onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, googleMaps: e.target.value}})}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" 
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    These links will be displayed as clickable icons on the booking confirmation page (Step 7) to encourage customers to follow you or leave reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "chatbot" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <MessageSquare size={20} className="text-primary" />
                  Chatbot Configuration
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{formData.chatbotEnabled ? 'Enabled' : 'Disabled'}</span>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, chatbotEnabled: !formData.chatbotEnabled})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.chatbotEnabled ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.chatbotEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Chatbot Type</label>
                    <select 
                      value={formData.chatbotConfig.type}
                      onChange={(e) => handleChatbotConfigChange('type', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
                    >
                      <option value="whatsapp">WhatsApp Direct</option>
                      <option value="messenger">Facebook Messenger</option>
                      <option value="script">Custom Script (Tawk.to, etc.)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {formData.chatbotConfig.type === 'whatsapp' ? 'WhatsApp Phone Number' : 
                       formData.chatbotConfig.type === 'messenger' ? 'Facebook Page ID/Username' : 
                       'Script URL / Snippet'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.chatbotConfig.value}
                      onChange={(e) => handleChatbotConfigChange('value', e.target.value)}
                      placeholder={formData.chatbotConfig.type === 'whatsapp' ? '+1234567890' : 'YourPageName'}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Welcome Message</label>
                  <textarea 
                    value={formData.chatbotConfig.welcomeMessage}
                    onChange={(e) => handleChatbotConfigChange('welcomeMessage', e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" 
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Preset Q&A Responses</label>
                    <p className="text-xs text-gray-500">Configure 5 common questions and their automated answers to show in the chatbot.</p>
                  </div>
                  {formData.chatbotConfig.faq?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <span className="text-primary font-bold w-4 text-sm mt-2">{idx + 1}.</span>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</label>
                          <input 
                            type="text" 
                            value={item.q}
                            onChange={(e) => {
                              const newFaq = [...formData.chatbotConfig.faq];
                              newFaq[idx].q = e.target.value;
                              handleChatbotConfigChange('faq', newFaq);
                            }}
                            placeholder="Customer asks..."
                            className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm bg-white" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto Answer</label>
                          <textarea 
                            value={item.a}
                            onChange={(e) => {
                              const newFaq = [...formData.chatbotConfig.faq];
                              newFaq[idx].a = e.target.value;
                              handleChatbotConfigChange('faq', newFaq);
                            }}
                            placeholder="Bot replies with..."
                            rows={2}
                            className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm bg-white" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    {formData.chatbotConfig.type === 'whatsapp' ? 
                      "Customers will be redirected to WhatsApp to chat with you." : 
                      formData.chatbotConfig.type === 'messenger' ? 
                      "Customers will open a Facebook Messenger chat with your page." : 
                      "Paste your third-party chatbot script URL here."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Payment Settings Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-2 text-gray-900 font-bold">
                <DollarSign size={20} className="text-primary" />
                Payment Integrations
              </div>
              <div className="p-6 space-y-8">
                
                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Security Best Practices</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      • Your API keys are stored securely. Never share your PayPal Secret or Stripe API keys with anyone.<br/>
                      • We recommend using "Restricted Keys" if your provider supports them.<br/>
                      • For local payments, ensure your account name matches exactly.
                    </p>
                  </div>
                </div>

                {enabledPayments.length === 0 && (
                  <p className="text-center py-4 text-gray-500 italic text-sm">
                    No online payment methods enabled by Super Admin.
                  </p>
                )}

                {enabledPayments.includes("Credit Card") && (
                  <div className="space-y-4 p-4 border border-gray-100 rounded-2xl">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Credit Card (Stripe/Square)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase">API Key / Secret</label>
                        <input 
                          type="password" 
                          value={formData.paymentConfig.creditCard.apiKey}
                          onChange={(e) => handleConfigChange('creditCard', 'apiKey', e.target.value)}
                          placeholder="sk_live_..."
                          className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm font-mono" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase">Merchant ID</label>
                        <input 
                          type="text" 
                          value={formData.paymentConfig.creditCard.merchantId}
                          onChange={(e) => handleConfigChange('creditCard', 'merchantId', e.target.value)}
                          placeholder="m_12345"
                          className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {enabledPayments.includes("PayPal") && (
                  <div className="space-y-4 p-4 border border-gray-100 rounded-2xl">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      PayPal Integration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase">Client ID</label>
                        <input 
                          type="text" 
                          value={formData.paymentConfig.paypal.clientId}
                          onChange={(e) => handleConfigChange('paypal', 'clientId', e.target.value)}
                          placeholder="PayPal Client ID"
                          className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase">Client Secret</label>
                        <input 
                          type="password" 
                          value={formData.paymentConfig.paypal.secret}
                          onChange={(e) => handleConfigChange('paypal', 'secret', e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm font-mono" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {enabledPayments.includes("Pay in Store") && (
                  <div className="space-y-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-green-500" />
                      Local Pay (In-Store)
                    </h4>
                    <p className="text-xs text-gray-500 italic">No configuration needed. Customers will pay when they arrive.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                <CheckCircle size={16} /> All changes saved successfully!
              </span>
            )}
          </div>
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
