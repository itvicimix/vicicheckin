"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendSMS } from "./sms";
import { getTenantById } from "./tenant";
import { getSystemSettings } from "./settings";
import { createNotification } from "./notification";
import { sendPushNotification } from "./push";

function replaceSmsVariables(template: string, data: any) {
  return template
    .replace(/%customer_full_name%/g, data.customerName || "")
    .replace(/%service_name%/g, data.serviceName || "")
    .replace(/%appointment_start_time%/g, `${data.date} at ${data.time}` || "")
    .replace(/%tenant_name%/g, data.tenantName || "");
}

export async function createBooking({
  tenantId,
  customerName,
  customerPhone,
  service,
  staff,
  date,
  time,
  status = "Pending",
  discountPercentage = 0,
  promotionPrize = null,
  notes = null,
}: {
  tenantId: string;
  customerName: string;
  customerPhone: string;
  service: { id: string; name: string; price: string; duration?: number };
  staff: { id: string; name: string } | null;
  date: string;
  time: string;
  status?: string;
  discountPercentage?: number;
  promotionPrize?: string | null;
  notes?: string | null;
}) {
  try {
    // 1. Ensure the Service exists in the DB (Upsert using the ID from the store)
    const dbService = await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: {
        id: service.id,
        tenantId,
        name: service.name,
        price: parseFloat(service.price.replace(/[^0-9.]/g, "")) || 0,
        duration: service.duration || 30,
      },
    });

    // 2. Ensure Staff exists if provided
    let dbStaff = null;
    if (staff && staff.id) {
      dbStaff = await prisma.staff.upsert({
        where: { id: staff.id },
        update: {},
        create: {
          id: staff.id,
          tenantId,
          name: staff.name,
          role: "Staff",
        },
      });
    }

    // 3. Ensure Customer exists (using phone as key)
    let dbCustomer = await prisma.customer.findFirst({
      where: { 
        tenantId,
        phone: customerPhone 
      }
    });

    // Calculate points to add
    const originalPrice = parseFloat(service.price.replace(/[^0-9.]/g, "")) || 0;
    const finalPrice = originalPrice * (1 - (discountPercentage || 0) / 100);
    const pointsEarned = Math.floor(finalPrice / 3);

    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: {
          tenantId,
          name: customerName,
          phone: customerPhone,
          points: pointsEarned,
        }
      });
    } else {
      dbCustomer = await prisma.customer.update({
        where: { id: dbCustomer.id },
        data: {
          points: {
            increment: pointsEarned
          }
        }
      });
    }

    // 4. Create the Booking
    const booking = await prisma.booking.create({
      data: {
        tenantId,
        customerName,
        customerPhone,
        serviceId: dbService.id,
        staffId: dbStaff ? dbStaff.id : null,
        customerId: dbCustomer.id,
        date, // YYYY-MM-DD format
        time, // HH:MM format
        status,
        notes,
      },
    });

    // 5. Redeem Promotion if any
    if (promotionPrize) {
      const claim = await prisma.promotionClaim.findFirst({
        where: { tenantId, phone: customerPhone, status: "Unused" }
      });
      if (claim) {
        await prisma.promotionClaim.update({
          where: { id: claim.id },
          data: { status: "Redeemed" }
        });
      }
    }

    // 6. Send SMS Notification (Pending)
    try {
      const [tenant, settings] = await Promise.all([
        getTenantById(tenantId),
        getSystemSettings()
      ]);

      if (tenant && customerPhone && settings) {
        const template = settings.pendingSmsTemplate || "Hi %customer_full_name%, your appointment for %service_name% at %tenant_name% on %appointment_start_time% is PENDING. We will notify you once approved.";
        const message = replaceSmsVariables(template, {
          customerName,
          serviceName: service.name,
          date,
          time,
          tenantName: tenant.name
        });
        await sendSMS(customerPhone, message);
      }
    } catch (smsError) {
      console.error("Failed to send pending SMS:", smsError);
    }

    // 7. Create Notification for Admin
    try {
      await createNotification(
        tenantId,
        "appointment",
        "New Appointment",
        `${customerName} just booked ${service.name} on ${date} at ${time}.`
      );

      // 8. Trigger Web Push Notification
      const tenant = await getTenantById(tenantId);
      if (tenant) {
        await sendPushNotification(
          tenantId,
          "Lịch hẹn mới! 📅",
          `${customerName} vừa đặt ${service.name} vào ${date} lúc ${time}`,
          `/${tenant.slug}/admin/appointments`
        );
      }
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    // Revalidate paths so they show up immediately
    revalidatePath(`/[tenantSlug]/admin/calendar`, "page");
    revalidatePath(`/[tenantSlug]/admin/appointments`, "page");
    
    return { 
      success: true, 
      booking: {
        ...booking,
        createdAt: booking.createdAt.toISOString()
      } 
    };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { success: false, error: "Failed to create booking." };
  }
}

export async function getBookings(tenantId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { tenantId },
      include: {
        service: true,
        staff: true,
      },
      orderBy: [
        { date: "asc" },
        { time: "asc" },
      ],
    });
    // Manual serialization to avoid any hidden BigInt or complex object issues
    const serialized = bookings.map(b => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      service: b.service ? { ...b.service, createdAt: b.service.createdAt.toISOString() } : null,
      staff: b.staff ? { ...b.staff, createdAt: b.staff.createdAt.toISOString() } : null,
    }));

    return serialized;
  } catch (error) {
    console.error("Failed to fetch bookings in action:", error);
    return [];
  }
}

export async function updateBookingStatus(id: string, status: string, tenantId: string) {
  try {
    // Verify ownership indirectly by including tenantId in the where clause
    const booking = await prisma.booking.update({
      where: { 
        id: id,
        tenantId: tenantId 
      },
      data: { status },
      include: {
        service: true,
        tenant: true,
      }
    });

    // Send SMS Notification (Approved or Rejected)
    if ((status === "Approved" || status === "Rejected") && booking.customerPhone) {
      try {
        const settings = await getSystemSettings();
        if (settings) {
          let template = "";
          if (status === "Approved") {
            template = settings.approvedSmsTemplate || "Hi %customer_full_name%, your appointment for %service_name% at %tenant_name% on %appointment_start_time% has been APPROVED! See you then.";
          } else if (status === "Rejected") {
            template = settings.rejectedSmsTemplate || "Hi %customer_full_name%, unfortunately your appointment for %service_name% at %tenant_name% on %appointment_start_time% has been REJECTED. Please contact us for more info.";
          }

          if (template) {
            const message = replaceSmsVariables(template, {
              customerName: booking.customerName,
              serviceName: booking.service.name,
              date: booking.date,
              time: booking.time,
              tenantName: booking.tenant.name
            });
            await sendSMS(booking.customerPhone, message);
          }
        }
      } catch (smsError) {
        console.error(`Failed to send ${status} SMS:`, smsError);
      }
    }

    
    revalidatePath(`/[tenantSlug]/admin/calendar`, "page");
    revalidatePath(`/[tenantSlug]/admin/appointments`, "page");
    return { success: true, booking };
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return { success: false, error: "Failed to update booking status." };
  }
}
