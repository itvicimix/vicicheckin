"use server";

import { prisma } from "@/lib/prisma";

export async function getDatabaseStats() {
  console.log("getDatabaseStats action called");
  try {
    const [
      tenantCount,
      bookingCount,
      customerCount,
      staffCount,
      serviceCount,
      promotionCount
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.booking.count(),
      prisma.customer.count(),
      prisma.staff.count(),
      prisma.service.count(),
      prisma.promotionClaim.count()
    ]);

    console.log("Stats fetched successfully:", { tenantCount, bookingCount, promotionCount });

    return {
      success: true,
      stats: {
        tenants: tenantCount,
        bookings: bookingCount,
        customers: customerCount,
        staff: staffCount,
        services: serviceCount,
        promotions: promotionCount
      }
    };
  } catch (error) {
    console.error("Failed to fetch database stats in action:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch database statistics" };
  }
}

export async function exportFullDatabase() {
  console.log("exportFullDatabase action called");
  try {
    // Fetch all tables
    const [
      tenants,
      bookings,
      customers,
      staff,
      services,
      promotions
    ] = await Promise.all([
      prisma.tenant.findMany(),
      prisma.booking.findMany(),
      prisma.customer.findMany(),
      prisma.staff.findMany(),
      prisma.service.findMany(),
      prisma.promotionClaim.findMany()
    ]);

    console.log("Database exported successfully, row counts:", {
      tenants: tenants.length,
      bookings: bookings.length,
      promotions: promotions.length
    });

    return {
      success: true,
      data: {
        version: "1.1",
        timestamp: new Date().toISOString(),
        tables: {
          tenants,
          bookings,
          customers,
          staff,
          services,
          promotions
        }
      }
    };
  } catch (error) {
    console.error("Failed to export database in action:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to export database" };
  }
}
