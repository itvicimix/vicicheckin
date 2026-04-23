"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    });
    
    revalidatePath(`/[tenantSlug]/admin/calendar`, "page");
    revalidatePath(`/[tenantSlug]/admin/appointments`, "page");
    return { success: true, booking };
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return { success: false, error: "Failed to update booking status." };
  }
}
