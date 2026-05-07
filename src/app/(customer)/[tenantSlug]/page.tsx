import { BookingWizard } from "@/components/booking/BookingWizard";
import { notFound } from "next/navigation";
import { getTenantBySlug, getTenants } from "@/actions/tenant";
import { ChatbotWidget } from "@/components/common/ChatbotWidget";
import Image from "next/image";
import { ShieldAlert } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const response = await getTenants();
  if (response.success && response.data) {
    return response.data.map((tenant: any) => ({
      tenantSlug: tenant.slug,
    }));
  }
  return [];
}

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantBookingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { tenantSlug } = resolvedParams;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  if (tenant.status !== "Active") {
    const isMaintenance = tenant.status === "Maintenance";
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isMaintenance ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {isMaintenance ? 'Under Maintenance' : 'Service Temporarily Unavailable'}
          </h1>
          <p className="text-gray-600 font-medium">
            {isMaintenance 
              ? 'This business is currently undergoing maintenance. Please check back later.' 
              : 'The subscription for this business has expired or is currently suspended. Please contact the business owner for more information.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main 
      className="min-h-screen bg-background relative overflow-hidden flex flex-col"
      style={tenant.themeColor ? { '--color-primary': tenant.themeColor } as React.CSSProperties : undefined}
    >
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-1/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 py-6 px-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden ring-2 ring-primary/20 ${!tenant.logo ? 'bg-primary text-white' : 'bg-white'}`}>
              {tenant.logo ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={tenant.logo} 
                    alt="Logo" 
                    fill 
                    className="object-contain p-0.5" 
                    sizes="40px"
                    priority
                  />
                </div>
              ) : (
                tenant.name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="font-semibold text-lg text-gray-900">{tenant.name}</h1>
              <p className="text-xs text-gray-500">{tenant.location}</p>
            </div>
          </div>
          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Booking Wizard */}
      <div className="flex-1 relative z-10 py-4 md:py-8 px-4 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden h-[calc(100vh-120px)] max-h-[800px] flex flex-col">
          <BookingWizard tenant={tenant} />
        </div>
      </div>
      
      <ChatbotWidget tenant={tenant} />
    </main>
  );
}
