"use server";

import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// Configure web-push
// We add hardcoded fallbacks here so it works immediately on Hostinger without needing to configure .env
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "BJVb7S3LDy77F17_7U3-GUKRamS8nrho-86psTOFQ7wxwoLrQdi40zDizEJuzA4rGfGx8h_z8sFZ-5dndI8sKuY";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "TsxAy5nIdvgMOuGf9Z0pAxO9GPYGGX-MsLMmhM78SG4";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:admin@vicicheckin.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function savePushSubscription(tenantId: string, subscription: any) {
  try {
    const { endpoint, keys } = subscription;
    
    if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
      return { success: false, error: "Invalid subscription object" };
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        tenantId,
        auth: keys.auth,
        p256dh: keys.p256dh,
      },
      create: {
        tenantId,
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error saving push subscription:", error);
    return { success: false, error: error?.message || "Failed to save subscription on server" };
  }
}

export async function sendPushNotification(tenantId: string, title: string, body: string, url: string) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { tenantId }
    });

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({ title, body, url });

    const sendPromises = subscriptions.map(sub => {
      return webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      }, payload).catch(async (err) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription expired or invalid, remove it from DB
          try {
            await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
          } catch (e) {}
        } else {
          console.error("Error sending push notification to endpoint:", sub.endpoint, err);
        }
      });
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error("Error in sendPushNotification:", error);
  }
}
