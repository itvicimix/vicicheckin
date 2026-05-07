"use server";

import { prisma } from "@/lib/prisma";

export async function getRevenueReport(tenantId: string) {
  try {
    const now = new Date();
    
    // Start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        tenantId,
        status: "Approved", // Assuming "Approved" is the status for paid/completed bookings
      },
      include: {
        service: true,
      },
    });

    let weeklyRevenue = 0;
    let monthlyRevenue = 0;

    bookings.forEach((booking) => {
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      
      if (booking.service?.price) {
        if (bookingDate >= startOfWeek) {
          weeklyRevenue += booking.service.price;
        }
        if (bookingDate >= startOfMonth) {
          monthlyRevenue += booking.service.price;
        }
      }
    });

    return { success: true, weeklyRevenue, monthlyRevenue };
  } catch (error) {
    console.error("Failed to fetch revenue report:", error);
    return { success: false, weeklyRevenue: 0, monthlyRevenue: 0 };
  }
}

export async function getNewCustomersReport(tenantId: string) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const count = await prisma.customer.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return { success: true, newCustomers: count };
  } catch (error) {
    console.error("Failed to fetch new customers report:", error);
    return { success: false, newCustomers: 0 };
  }
}

export async function getPopularServicesReport(tenantId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        tenantId,
        status: "Approved",
      },
      include: {
        service: true,
      },
    });

    const serviceCounts: Record<string, { name: string; count: number; revenue: number }> = {};

    bookings.forEach((booking) => {
      if (booking.serviceId && booking.service) {
        if (!serviceCounts[booking.serviceId]) {
          serviceCounts[booking.serviceId] = {
            name: booking.service.name,
            count: 0,
            revenue: 0,
          };
        }
        serviceCounts[booking.serviceId].count += 1;
        serviceCounts[booking.serviceId].revenue += booking.service.price;
      }
    });

    const popularServices = Object.values(serviceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { success: true, popularServices };
  } catch (error) {
    console.error("Failed to fetch popular services report:", error);
    return { success: false, popularServices: [] };
  }
}
