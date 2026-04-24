"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCoupons(tenantId: string) {
  try {
    return await prisma.coupon.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
}

export async function createCoupon(data: {
  tenantId: string;
  name: string;
  code: string;
  discountValue: number;
  startDate: string;
  endDate: string;
}) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        code: data.code.toUpperCase(),
        discountValue: data.discountValue,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
    revalidatePath("/[tenantSlug]/admin/promotions", "page");
    return { success: true, coupon };
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    if (error.code === 'P2002') return { success: false, error: "Coupon code already exists" };
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/[tenantSlug]/admin/promotions", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    return { success: false, error: error.message };
  }
}

export async function validateCoupon(tenantId: string, code: string) {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        tenantId,
        code: code.toUpperCase(),
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });
    
    if (!coupon) return { success: false, error: "Invalid or expired coupon" };
    return { success: true, coupon };
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return { success: false, error: "System error" };
  }
}
