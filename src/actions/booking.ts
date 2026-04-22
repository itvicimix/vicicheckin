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
}: {
  tenantId: string;
  customerName: string;
  customerPhone: string;
  service: { id: string; name: string; price: string; duration?: number };
  staff: { id: string; name: string } | null;
  date: string;
  time: string;
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

    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: {
          tenantId,
          name: customerName,
          phone: customerPhone,
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
        status: "Pending",
      },
    });

    // Revalidate the admin calendar path so it shows up immediately
    revalidatePath(`/[tenantSlug]/admin/calendar`, "page");
    return { success: true, booking };
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
    return bookings;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
}
