"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStaff(tenantId: string) {
  try {
    const staff = await prisma.staff.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return JSON.parse(JSON.stringify(staff));
  } catch (error) {
    console.error("Failed to fetch staff:", error);
    return [];
  }
}

export async function createStaff(tenantId: string, data: any) {
  try {
    const staff = await prisma.staff.create({
      data: {
        tenantId,
        name: data.name,
        role: data.role || "Staff",
        phone: data.phone || null,
        workHours: data.workHours || '{"Monday":"09:00 - 18:00","Tuesday":"09:00 - 18:00","Wednesday":"09:00 - 18:00","Thursday":"09:00 - 18:00","Friday":"09:00 - 18:00","Saturday":"Off","Sunday":"Off"}',
        dayOff: data.dayOff || "None",
      },
    });

    revalidatePath("/[tenantSlug]/admin/staff", "page");
    return { success: true, staff };
  } catch (error) {
    console.error("Failed to create staff:", error);
    return { success: false, error: "Lỗi hệ thống khi tạo nhân viên" };
  }
}

export async function updateStaff(id: string, data: any) {
  try {
    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        phone: data.phone || null,
        workHours: data.workHours || '{"Monday":"09:00 - 18:00","Tuesday":"09:00 - 18:00","Wednesday":"09:00 - 18:00","Thursday":"09:00 - 18:00","Friday":"09:00 - 18:00","Saturday":"Off","Sunday":"Off"}',
        dayOff: data.dayOff || "None",
      },
    });

    revalidatePath("/[tenantSlug]/admin/staff", "page");
    return { success: true, staff };
  } catch (error) {
    console.error("Failed to update staff:", error);
    return { success: false, error: "Lỗi hệ thống khi cập nhật nhân viên" };
  }
}

export async function deleteStaff(id: string) {
  try {
    await prisma.staff.delete({ where: { id } });
    revalidatePath("/[tenantSlug]/admin/staff", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete staff:", error);
    return { success: false, error: "Lỗi hệ thống khi xóa" };
  }
}

export async function updateStaffTimeOff(staffId: string, timeOffDates: string[]) {
  try {
    const staff = await prisma.staff.update({
      where: { id: staffId },
      data: {
        timeOffDates: JSON.stringify(timeOffDates)
      }
    });
    
    // We can't know the exact slug here directly from staff unless we query tenant, 
    // but revalidatePath with generic admin path might work or we can just use layout revalidate
    revalidatePath("/[tenantSlug]/admin/working-hours", "page");
    return { success: true, data: JSON.parse(JSON.stringify(staff)) };
  } catch (error: any) {
    console.error("Failed to update staff time off:", error);
    return { success: false, error: "Lỗi hệ thống khi cập nhật ngày nghỉ" };
  }
}
