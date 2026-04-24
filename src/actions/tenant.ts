"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: JSON.parse(JSON.stringify(tenants)) };
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
    return tenant ? JSON.parse(JSON.stringify(tenant)) : null;
  } catch (error) {
    console.error("Failed to fetch tenant by slug:", error);
    return null;
  }
}

export async function getTenantById(id: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id }
    });
    return tenant ? JSON.parse(JSON.stringify(tenant)) : null;
  } catch (error) {
    console.error("Failed to fetch tenant by id:", error);
    return null;
  }
}


export async function createTenant(data: any) {
  try {
    const { name, slug, adminEmail, adminPassword, itPassword, themeColor, logo, location, phone, payments } = data;

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
        itPassword: itPassword || null,
        themeColor: themeColor || "#000000",
        logo: logo || null,
        location,
        phone,
        payments: JSON.stringify(payments),
        status: "Active",
      },
    });

    revalidatePath("/super-admin");
    return { success: true, data: JSON.parse(JSON.stringify(tenant)) };
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
        name: data.name !== undefined ? data.name : undefined,
        location: data.location !== undefined ? data.location : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        slotInterval: data.slotInterval !== undefined ? (parseInt(data.slotInterval) || 30) : undefined,
        minLeadTime: data.minLeadTime !== undefined ? (parseInt(data.minLeadTime) || 60) : undefined,
        themeColor: data.themeColor !== undefined ? data.themeColor : undefined,
        adminEmail: data.adminEmail !== undefined ? data.adminEmail : undefined,
        adminPassword: data.adminPassword !== undefined ? data.adminPassword : undefined,
        itPassword: data.itPassword !== undefined ? data.itPassword : undefined,
        logo: data.logo !== undefined ? data.logo : undefined,
        googleReviewUrl: data.googleReviewUrl !== undefined ? data.googleReviewUrl : undefined,
        socialLinks: data.socialLinks !== undefined ? (data.socialLinks ? JSON.stringify(data.socialLinks) : null) : undefined,
        paymentConfig: data.paymentConfig !== undefined ? (data.paymentConfig ? JSON.stringify(data.paymentConfig) : null) : undefined,
      },
    });

    revalidatePath(`/${tenant.slug}/admin/settings`);
    return { success: true, data: JSON.parse(JSON.stringify(tenant)) };
  } catch (error: any) {
    console.error("Failed to update tenant settings:", error);
    return { success: false, error: `Lỗi hệ thống: ${error.message || "Không rõ nguyên nhân"}` };
  }
}

export async function updateLuckyWheel(tenantId: string, data: { enabled?: boolean, config?: any }) {
  try {
    const current = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { luckyWheelEnabled: true, luckyWheelLastDisabled: true }
    });

    if (!current) return { success: false, error: "Tenant not found" };

    const updateData: any = {};
    
    if (data.enabled !== undefined) {
      if (data.enabled) {
        // Turning ON: Check 7-day rule
        if (current.luckyWheelLastDisabled) {
          const lastDisabled = new Date(current.luckyWheelLastDisabled);
          const diffDays = (new Date().getTime() - lastDisabled.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 7) {
            const remaining = Math.ceil(7 - diffDays);
            return { success: false, error: `Bạn phải đợi thêm ${remaining} ngày nữa mới có thể bật lại Vòng quay may mắn.` };
          }
        }
        updateData.luckyWheelEnabled = true;
      } else {
        // Turning OFF
        updateData.luckyWheelEnabled = false;
        updateData.luckyWheelLastDisabled = new Date();
      }
    }

    if (data.config) {
      updateData.luckyWheelConfig = JSON.stringify(data.config);
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData
    });

    revalidatePath(`/${tenant.slug}/admin/promotions`);
    return { success: true, data: JSON.parse(JSON.stringify(tenant)) };
  } catch (error: any) {
    console.error("Failed to update lucky wheel:", error);
    return { success: false, error: "Lỗi hệ thống khi cập nhật Vòng quay may mắn" };
  }
}
