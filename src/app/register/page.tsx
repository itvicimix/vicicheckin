"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ShieldCheck, User, Building, MapPin, Mail, Lock, Phone } from "lucide-react";
import { registerTrial } from "@/actions/register";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    businessName: "",
    email: "",
    location: "",
    googleMapUrl: "",
    businessType: "Nail Salon",
    username: "",
    password: ""
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const res = await registerTrial(formData);
    
    if (res.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(res.error || "Failed to submit application.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Header */}
      <nav className="relative z-10 px-6 py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="font-clash font-bold text-sm text-white">NB</span>
             </div>
             <span className="font-clash text-lg font-semibold tracking-wide text-white">Nail Book 24/7</span>
          </Link>
          <Link href="/nailbook247/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Already have an account? Sign In
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full bg-[#121826] border border-white/10 rounded-[2rem] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} className="text-green-400" />
              </div>
              <h2 className="text-3xl font-clash font-semibold mb-4">Application Submitted!</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Thank you for choosing Nail Book 24/7. Your 30-day trial request has been securely submitted and is pending Super Admin review.
                We will notify you once your workspace is activated.
              </p>
              <Link href="/" className="inline-flex items-center justify-center w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all">
                Return to Home
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full"
            >
              <div className="text-center mb-10 mt-10">
                <h1 className="text-4xl md:text-5xl font-clash font-semibold mb-4">Start Your 30-Day Trial</h1>
                <p className="text-slate-400 text-lg">Experience the new standard of salon management. No credit card required.</p>
              </div>

              <div className="bg-[#121826] border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl">
                
                {status === "error" && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Jane Doe" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Business Name</label>
                        <div className="relative">
                          <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input required type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Star Nails Studio" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Business Type</label>
                        <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                          <option>Nail Salon</option>
                          <option>Hair Salon</option>
                          <option>Beauty Salon</option>
                          <option>Spa</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-2">Location / Address</label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="123 Luxury Ave, Beverly Hills, CA" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-2">Google Map URL (Optional)</label>
                        <input type="url" name="googleMapUrl" value={formData.googleMapUrl} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="https://maps.google.com/..." />
                      </div>
                    </div>
                  </div>

                  {/* Account Setup */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Account Setup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-2">Admin Email</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="owner@starnails.com" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Username</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input required type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="admin_star" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Password</label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      disabled={status === "submitting"}
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {status === "submitting" ? (
                        <><Loader2 className="animate-spin" size={24} /> Processing...</>
                      ) : (
                        <>Submit Request <ArrowRight size={20} /></>
                      )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4">
                      By submitting, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
