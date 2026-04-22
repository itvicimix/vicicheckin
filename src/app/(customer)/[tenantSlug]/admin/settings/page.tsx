"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Settings, Save, Clock, Calendar, MapPin, Phone, Palette, Loader2, CheckCircle, DollarSign } from "lucide-react";
import { getTenantBySlug, updateTenantSettings } from "@/actions/tenant";

export default function SettingsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tenant, setTenant] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    location: "",
    phone: "",
    slotInterval: "30",
    minLeadTime: "60",
    themeColor: "#000000",
    paymentConfig: {
      creditCard: { apiKey: "", merchantId: "" },
      paypal: { clientId: "", secret: "" },
      localPay: { phoneNumber: "", accountName: "" }
    }
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

        setFormData({
          name: t.name || "",
          location: t.location || "",
          phone: t.phone || "",
          slotInterval: t.slotInterval?.toString() || "30",
          minLeadTime: t.minLeadTime?.toString() || "60",
          themeColor: t.themeColor || "#000000",
          paymentConfig: config
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Salon Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Configure your business details, booking rules, and payment integrations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
