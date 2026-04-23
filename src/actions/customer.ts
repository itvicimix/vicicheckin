"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers(tenantId: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        bookings: {
          select: {
            id: true,
            createdAt: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Transform to include aggregated data and ensure plain object
    return customers.map(c => {
      const points = c.points || 0;
      let tier = "Thường";
      if (points >= 2000) tier = "Kim Cương";
      else if (points >= 1000) tier = "Vàng";
      else if (points >= 500) tier = "Bạc";
      else if (points > 100) tier = "Đồng";

      return {
        id: c.id,
        tenantId: c.tenantId,
        name: c.name,
        phone: c.phone,
        email: c.email,
        vip: c.vip,
        points,
        tier,
        createdAt: c.createdAt.toISOString(),
        visits: c.bookings.length,
        lastVisit: c.bookings.length > 0 
          ? c.bookings[0].createdAt.toISOString() 
          : "No visits",
      };
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function syncCustomersData(tenantId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { tenantId },
      include: { service: true }
    });

    const customers = await prisma.customer.findMany({ where: { tenantId } });
    const customerPhoneMap = new Map();
    customers.forEach(c => {
      if (c.phone) customerPhoneMap.set(c.phone, c.id);
    });

    const customerPoints = new Map<string, number>();

    for (const booking of bookings) {
      if (booking.customerPhone && customerPhoneMap.has(booking.customerPhone)) {
        const cId = customerPhoneMap.get(booking.customerPhone);
        
        if (booking.customerId !== cId) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { customerId: cId }
          });
        }

        const price = booking.service.price || 0;
        const points = Math.floor(price / 3);
        customerPoints.set(cId, (customerPoints.get(cId) || 0) + points);
      }
    }

    for (const [cId, points] of customerPoints.entries()) {
      await prisma.customer.update({
        where: { id: cId },
        data: { points }
      });
    }

    revalidatePath("/[tenantSlug]/admin/customers", "page");
    return { success: true };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, error: "Lỗi đồng bộ dữ liệu" };
  }
}

export async function createCustomer(tenantId: string, data: { name: string, phone?: string, email?: string, vip?: boolean }) {
  try {
    await prisma.customer.create({
      data: {
        tenantId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        vip: data.vip || false,
      },
    });

    revalidatePath("/[tenantSlug]/admin/customers", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to create customer:", error);
    return { success: false, error: "Lỗi hệ thống khi tạo khách hàng" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/[tenantSlug]/admin/customers", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return { success: false, error: "Lỗi hệ thống khi xóa khách hàng" };
  }
}

export async function updateCustomer(id: string, data: { name: string, phone?: string, email?: string, vip?: boolean }) {
  try {
    await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        vip: data.vip,
      },
    });

    revalidatePath("/[tenantSlug]/admin/customers", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to update customer:", error);
    return { success: false, error: "Lỗi hệ thống khi cập nhật khách hàng" };
  }
}

export async function importCustomers(tenantId: string, customersData: { name: string, phone?: string, email?: string }[]) {
  try {
    if (!customersData || customersData.length === 0) {
      return { success: false, error: "Không có dữ liệu khách hàng để nhập" };
    }

    const data = customersData.map(c => ({
      tenantId,
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      vip: false,
    }));

    const result = await prisma.customer.createMany({
      data,
      skipDuplicates: true,
    });

    revalidatePath("/[tenantSlug]/admin/customers", "page");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to import customers:", error);
    return { success: false, error: "Lỗi hệ thống khi nhập dữ liệu khách hàng" };
  }
}

export async function deleteCustomers(ids: string[]) {
  try {
    if (!ids || ids.length === 0) return { success: true };
    await prisma.customer.deleteMany({
      where: { id: { in: ids } }
    });
    revalidatePath("/[tenantSlug]/admin/customers", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk delete customers:", error);
    return { success: false, error: "Lỗi hệ thống khi xóa nhiều khách hàng" };
  }
}
