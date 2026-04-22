"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: tenants };
  } catch (error) {
    console.error("Failed to fetch tenants:", error);
    return { success: false, error: "Failed to fetch tenants" };
  }
}

export async function getTenantBySlug(slug: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    });
    return tenant;
  } catch (error) {
    console.error("Failed to fetch tenant by slug:", error);
    return null;
  }
}

export async function createTenant(data: any) {
  try {
    const { name, slug, adminEmail, adminPassword, themeColor, location, phone, payments } = data;

    if (!name || !slug || !adminEmail || !adminPassword) {
      return { success: false, error: "Vui lòng điền đầy đủ các trường bắt buộc (Tên, Slug, Email, Password)" };
    }

    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "URL Slug này đã tồn tại, vui lòng chọn tên khác." };
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        adminEmail,
        adminPassword,
        themeColor: themeColor || "#000000",
        location,
        phone,
        payments: JSON.stringify(payments),
        status: "Active",
      },
    });

    revalidatePath("/super-admin");
    return { success: true, data: tenant };
  } catch (error) {
    console.error("Failed to create tenant:", error);
    return { success: false, error: "Đã xảy ra lỗi khi tạo tiệm vào Database." };
  }
}

export async function updateTenantSettings(tenantId: string, data: any) {
  try {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        location: data.location,
        phone: data.phone,
        slotInterval: parseInt(data.slotInterval) || 30,
        minLeadTime: parseInt(data.minLeadTime) || 60,
        themeColor: data.themeColor,
        paymentConfig: data.paymentConfig ? JSON.stringify(data.paymentConfig) : null,
      },
    });

    revalidatePath("/[tenantSlug]/admin/settings", "page");
    return { success: true, data: tenant };
  } catch (error) {
    console.error("Failed to update tenant settings:", error);
    return { success: false, error: "Lỗi hệ thống khi cập nhật cài đặt" };
  }
}
