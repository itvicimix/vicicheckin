"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getServices(tenantId: string) {
  try {
    const services = await prisma.service.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return JSON.parse(JSON.stringify(services));
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

export async function createService(tenantId: string, data: any) {
  try {
    const service = await prisma.service.create({
      data: {
        tenantId,
        name: data.name,
        price: parseFloat(data.price) || 0,
        duration: parseInt(data.duration) || 30,
        category: data.category || "General",
      },
    });

    revalidatePath("/[tenantSlug]/admin/services", "page");
    return { success: true, service: JSON.parse(JSON.stringify(service)) };
  } catch (error) {
    console.error("Failed to create service:", error);
    return { success: false, error: "Lỗi hệ thống khi tạo dịch vụ" };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/[tenantSlug]/admin/services", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete service:", error);
    return { success: false, error: "Lỗi hệ thống khi xóa" };
  }
}

export async function updateService(id: string, data: any) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        price: parseFloat(data.price) || 0,
        duration: parseInt(data.duration) || 30,
        category: data.category || "General",
      },
    });

    revalidatePath("/[tenantSlug]/admin/services", "page");
    return { success: true, service: JSON.parse(JSON.stringify(service)) };
  } catch (error) {
    console.error("Failed to update service:", error);
    return { success: false, error: "Lỗi hệ thống khi cập nhật" };
  }
}

export async function importServices(tenantId: string, services: any[]) {
  try {
    const dataToCreate = services.map(s => ({
      tenantId,
      name: s.name,
      price: parseFloat(s.price) || 0,
      duration: parseInt(s.duration) || 30,
      category: s.category || "General",
    }));

    await prisma.service.createMany({
      data: dataToCreate
    });

    revalidatePath("/[tenantSlug]/admin/services", "page");
    return { success: true, count: dataToCreate.length };
  } catch (error) {
    console.error("Failed to import services:", error);
    return { success: false, error: "Lỗi hệ thống khi import dịch vụ" };
  }
}
