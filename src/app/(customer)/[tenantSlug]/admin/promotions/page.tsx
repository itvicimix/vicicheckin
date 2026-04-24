"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCoupons, createCoupon, deleteCoupon } from "@/actions/coupon";
import { getTenantBySlug, updateLuckyWheel } from "@/actions/tenant";
import { Plus, Trash2, Tag, Calendar, Loader2, X, Settings2, RefreshCw, AlertCircle } from "lucide-react";

export default function PromotionsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [coupons, setCoupons] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formStart, setFormStart] = useState(new Date().toISOString().split('T')[0]);
  const [formEnd, setFormEnd] = useState("");

  // Lucky Wheel state
  const [luckyWheelConfig, setLuckyWheelConfig] = useState<any[]>([
    { label: "10% Off", value: 10, probability: 20 },
    { label: "15% Off", value: 15, probability: 10 },
    { label: "20% Off", value: 20, probability: 5 },
    { label: "5% Off", value: 5, probability: 40 },
    { label: "Free Gift", value: 0, probability: 25 },
  ]);
  const [isUpdatingWheel, setIsUpdatingWheel] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const t = await getTenantBySlug(tenantSlug);
        if (t) {
          setTenant(t);
          const data = await getCoupons(t.id);
          setCoupons(data);
          
          if (t.luckyWheelConfig) {
            try {
              setLuckyWheelConfig(JSON.parse(t.luckyWheelConfig));
            } catch (e) {}
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug]);

  const handleCreate = async () => {
    if (!tenant || !formName || !formCode || !formValue || !formStart || !formEnd) {
      alert("Please fill all fields");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createCoupon({
        tenantId: tenant.id,
        name: formName,
        code: formCode,
        discountValue: parseFloat(formValue),
        startDate: formStart,
        endDate: formEnd
      });

      if (result.success) {
        setCoupons([result.coupon, ...coupons]);
        setShowAddModal(false);
        setFormName("");
        setFormCode("");
        setFormValue("");
        setFormEnd("");
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to create coupon");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const result = await deleteCoupon(id);
      if (result.success) {
        setCoupons(coupons.filter(c => c.id !== id));
      }
    } catch (error) {
      alert("Failed to delete coupon");
    }
  };

  const handleToggleWheel = async () => {
    if (!tenant) return;
    setIsUpdatingWheel(true);
    try {
      const result = await updateLuckyWheel(tenant.id, { enabled: !tenant.luckyWheelEnabled });
      if (result.success) {
        setTenant(result.data);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to update lucky wheel");
    } finally {
      setIsUpdatingWheel(false);
    }
  };

  const handleSaveWheelConfig = async () => {
    if (!tenant) return;
    setIsUpdatingWheel(true);
    try {
      // Validate probabilities sum to 100
      const totalProb = luckyWheelConfig.reduce((sum, item) => sum + (parseFloat(item.probability) || 0), 0);
      if (Math.abs(totalProb - 100) > 0.1) {
        alert("Tổng tỷ lệ trúng thưởng phải bằng 100%. Hiện tại là: " + totalProb + "%");
        setIsUpdatingWheel(false);
        return;
      }

      const result = await updateLuckyWheel(tenant.id, { config: luckyWheelConfig });
      if (result.success) {
        setTenant(result.data);
        alert("Đã lưu cấu hình Vòng quay may mắn!");
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to save wheel config");
    } finally {
      setIsUpdatingWheel(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promotions & Coupons</h2>
          <p className="text-gray-500 text-sm">Manage discount codes and special offers.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
        >
          <Plus size={18} /> Create Wheel & Coupon
        </button>
      </div>

      {/* Lucky Wheel Status Display (Compact) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
              <RefreshCw size={20} className={tenant?.luckyWheelEnabled ? "animate-spin-slow" : ""} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Lucky Wheel Status
                {tenant?.luckyWheelEnabled ? (
                  <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-bold">Active</span>
                ) : (
                  <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold">Inactive</span>
                )}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleWheel}
              disabled={isUpdatingWheel}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm ${
                tenant?.luckyWheelEnabled 
                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
                : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isUpdatingWheel ? <Loader2 size={14} className="animate-spin" /> : tenant?.luckyWheelEnabled ? "Turn OFF" : "Turn ON"}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Tag size={20} className="text-primary" />
          Active Coupons
        </h3>
        {coupons.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500">
            No coupons created yet. Click "Create Coupon" to start.
          </div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-primary transition-all">
              <button 
                onClick={() => handleDelete(coupon.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{coupon.name}</h3>
                  <div className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 uppercase tracking-wider">{coupon.code}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Discount</span>
                  <span className="text-lg font-bold text-primary">{coupon.discountValue}% Off</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  <Calendar size={14} />
                  <span>{new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-gray-900">Create New Coupon</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Summer Sale" 
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input 
                  type="text" 
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. SUMMER20" 
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none uppercase" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. 20" 
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Start Date</label>
                  <input 
                    type="date" 
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:border-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">End Date</label>
                  <input 
                    type="date" 
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:border-primary outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* Lucky Wheel Configuration Section INSIDE Modal */}
            <div className="p-6 bg-orange-50/30 border-t border-orange-100">
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-sm">
                <RefreshCw size={16} className="text-orange-500" />
                Cấu hình Vòng quay (5 giải thưởng)
              </div>
              <div className="space-y-3">
                {luckyWheelConfig.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-orange-100 shadow-sm">
                    <input 
                      type="text" 
                      value={item.label}
                      onChange={(e) => {
                        const newConfig = [...luckyWheelConfig];
                        newConfig[idx].label = e.target.value;
                        setLuckyWheelConfig(newConfig);
                      }}
                      placeholder={`Prize ${idx+1}`}
                      className="text-xs p-1.5 border border-gray-100 rounded outline-none focus:border-orange-300"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-400 font-bold">%</span>
                      <input 
                        type="number" 
                        value={item.value}
                        onChange={(e) => {
                          const newConfig = [...luckyWheelConfig];
                          newConfig[idx].value = e.target.value;
                          setLuckyWheelConfig(newConfig);
                        }}
                        className="w-full text-xs p-1.5 border border-gray-100 rounded outline-none focus:border-orange-300"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-400 font-bold">Prob</span>
                      <input 
                        type="number" 
                        value={item.probability}
                        onChange={(e) => {
                          const newConfig = [...luckyWheelConfig];
                          newConfig[idx].probability = e.target.value;
                          setLuckyWheelConfig(newConfig);
                        }}
                        className="w-full text-xs p-1.5 border border-gray-100 rounded outline-none focus:border-orange-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-orange-600 mt-2 italic text-center">
                * Tổng tỷ lệ (Prob) phải bằng 100%
              </p>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={async () => {
                  // Validate probabilities sum to 100
                  const totalProb = luckyWheelConfig.reduce((sum, item) => sum + (parseFloat(item.probability) || 0), 0);
                  if (Math.abs(totalProb - 100) > 0.1) {
                    alert("Tổng tỷ lệ trúng thưởng phải bằng 100%. Hiện tại là: " + totalProb + "%");
                    return;
                  }
                  
                  // Save wheel config first
                  await updateLuckyWheel(tenant.id, { config: luckyWheelConfig });
                  // Then create the coupon
                  handleCreate();
                }}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save & Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
