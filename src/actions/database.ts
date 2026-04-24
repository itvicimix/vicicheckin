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
      promotionCount,
      couponCount,
      settingsCount
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.booking.count(),
      prisma.customer.count(),
      prisma.staff.count(),
      prisma.service.count(),
      prisma.promotionClaim.count(),
      prisma.coupon.count(),
      prisma.systemSettings.count()
    ]);

    return {
      success: true,
      stats: {
        tenants: tenantCount,
        bookings: bookingCount,
        customers: customerCount,
        staff: staffCount,
        services: serviceCount,
        promotions: promotionCount,
        coupons: couponCount,
        settings: settingsCount
      }
    };
  } catch (error) {
    console.error("Failed to fetch database stats:", error);
    return { success: false, error: "Failed to fetch database statistics" };
  }
}

export async function exportFullDatabase() {
  try {
    const [
      tenants,
      bookings,
      customers,
      staff,
      services,
      promotions,
      coupons,
      settings
    ] = await Promise.all([
      prisma.tenant.findMany(),
      prisma.booking.findMany(),
      prisma.customer.findMany(),
      prisma.staff.findMany(),
      prisma.service.findMany(),
      prisma.promotionClaim.findMany(),
      prisma.coupon.findMany(),
      prisma.systemSettings.findMany()
    ]);

    return {
      success: true,
      data: {
        version: "1.2",
        timestamp: new Date().toISOString(),
        tables: {
          tenants,
          bookings,
          customers,
          staff,
          services,
          promotions,
          coupons,
          settings
        }
      }
    };
  } catch (error) {
    console.error("Failed to export database:", error);
    return { success: false, error: "Failed to export database" };
  }
}

export async function importDatabase(data: any) {
  if (!data) return { success: false, error: "Invalid backup data format" };
  
  try {
    // Handle both wrapped format (UI) and flat format (CLI script)
    const tables = data.tables || data;
    
    const { 
      tenants, tenant,
      bookings, booking,
      customers, customer,
      staff,
      services, service,
      promotions, promotionClaim,
      coupons, coupon,
      settings, systemSettings 
    } = tables;

    // Use a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Clear everything (Order matters due to FK constraints)
      await tx.promotionClaim.deleteMany();
      await tx.coupon.deleteMany();
      await tx.booking.deleteMany();
      await tx.customer.deleteMany();
      await tx.staff.deleteMany();
      await tx.service.deleteMany();
      await tx.tenant.deleteMany();
      await tx.systemSettings.deleteMany();

      // 2. Re-populate (Order matters: Parent tables first)
      const s = settings || systemSettings;
      if (s?.length) await tx.systemSettings.createMany({ data: s });
      
      const t = tenants || tenant;
      if (t?.length) await tx.tenant.createMany({ data: t });
      
      const sv = services || service;
      if (sv?.length) await tx.service.createMany({ data: sv });
      
      const st = staff; // already plural in script? wait, script uses staff
      if (st?.length) await tx.staff.createMany({ data: st });
      
      const c = customers || customer;
      if (c?.length) await tx.customer.createMany({ data: c });
      
      const b = bookings || booking;
      if (b?.length) await tx.booking.createMany({ data: b });
      
      const cp = coupons || coupon;
      if (cp?.length) await tx.coupon.createMany({ data: cp });
      
      const p = promotions || promotionClaim;
      if (p?.length) await tx.promotionClaim.createMany({ data: p });
    });

    return { success: true };
  } catch (error: any) {
    console.error("Database import failed:", error);
    return { success: false, error: error.message || "Failed to import database" };
  }
}
