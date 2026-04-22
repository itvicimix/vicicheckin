"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStaff(tenantId: string) {
  try {
    const staff = await prisma.staff.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return staff;
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
      },
    });

    revalidatePath("/[tenantSlug]/admin/staff", "page");
    return { success: true, staff };
  } catch (error) {
    console.error("Failed to create staff:", error);
    return { success: false, error: "Lỗi hệ thống khi tạo nhân viên" };
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
