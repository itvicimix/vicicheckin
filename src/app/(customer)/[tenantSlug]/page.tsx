import { BookingWizard } from "@/components/booking/BookingWizard";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/actions/tenant";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantBookingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { tenantSlug } = resolvedParams;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-1/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 py-6 px-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-semibold text-lg text-gray-900">{tenant.name}</h1>
              <p className="text-xs text-gray-500">{tenant.location}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Booking Wizard */}
      <div className="flex-1 relative z-10 py-8 px-4 w-full">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden min-h-[600px] flex flex-col">
          <BookingWizard tenant={tenant} />
        </div>
      </div>
    </main>
  );
}
