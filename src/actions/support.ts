"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendSupportMessage(tenantId: string, sender: "ADMIN" | "SUPERADMIN", content: string) {
  try {
    const message = await prisma.supportMessage.create({
      data: {
        tenantId,
        sender,
        content
      }
    });

    revalidatePath(`/${tenantId}/admin/support`);
    revalidatePath(`/super-admin`);
    return { success: true, data: message };
  } catch (error: any) {
    console.error("Failed to send support message:", error);
    return { success: false, error: "System error while sending message" };
  }
}

export async function getSupportMessages(tenantId: string) {
  try {
    const messages = await prisma.supportMessage.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" }
    });
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function markSupportMessagesRead(tenantId: string, reader: "ADMIN" | "SUPERADMIN") {
  try {
    // If ADMIN is reading, mark SUPERADMIN messages as read
    // If SUPERADMIN is reading, mark ADMIN messages as read
    const senderToMark = reader === "ADMIN" ? "SUPERADMIN" : "ADMIN";
    
    await prisma.supportMessage.updateMany({
      where: {
        tenantId,
        sender: senderToMark,
        read: false
      },
      data: { read: true }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
