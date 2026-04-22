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
    
    // Transform to include aggregated data like visits and last visit
    return customers.map(c => ({
      ...c,
      visits: c.bookings.length,
      lastVisit: c.bookings.length > 0 
        ? c.bookings[0].createdAt.toISOString() 
        : "No visits",
    }));
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function createCustomer(tenantId: string, data: { name: string, phone?: string, email?: string, vip?: boolean }) {
  try {
    const customer = await prisma.customer.create({
      data: {
        tenantId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        vip: data.vip || false,
      },
    });

    revalidatePath("/[tenantSlug]/admin/customers", "page");
    return { success: true, customer };
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
