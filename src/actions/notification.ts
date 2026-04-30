"use server";

import { prisma } from "@/lib/prisma";

export async function getNotifications(tenantId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark as read" };
  }
}

export async function markAllAsRead(tenantId: string) {
  try {
    await prisma.notification.updateMany({
      where: { tenantId, read: false },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking all as read:", error);
    return { success: false, error: "Failed to mark all as read" };
  }
}

export async function createNotification(tenantId: string, type: string, title: string, message: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        tenantId,
        type,
        title,
        message,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}
