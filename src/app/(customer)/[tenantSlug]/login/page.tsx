"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { loginAdmin } from "@/actions/auth";
import { getTenantBySlug } from "@/actions/tenant";
import ReCAPTCHA from "react-google-recaptcha";

export default function TenantLogin() {
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  // Use Action State for better reliability
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      return await loginAdmin(tenantSlug, email, password);
    },
    { success: false, error: "" }
  );

  const [tenant, setTenant] = useState<any>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    getTenantBySlug(tenantSlug).then((data) => {
      if (data) setTenant(data);
    });
  }, [tenantSlug]);

  useEffect(() => {
    if (state.success) {
      router.push(`/${tenantSlug}/admin/calendar`);
    }
  }, [state.success, tenantSlug, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {tenant?.logo ? (
            <img src={tenant.logo} alt={tenant?.name || tenantSlug} className="w-16 h-16 rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg uppercase">
              {tenant?.name ? tenant.name.charAt(0) : tenantSlug.charAt(0)}
            </div>
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Dashboard for {tenant ? tenant.name : `/${tenantSlug}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {state.error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email / Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text" // Changed to text to support username or email
                  autoComplete="email"
                  required
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 outline-none border transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 outline-none border transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending || !recaptchaToken}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors items-center gap-2 disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>Sign in to Dashboard <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
