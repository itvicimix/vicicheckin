"use server";

import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// Configure web-push
// We add hardcoded fallbacks here so it works immediately on Hostinger without needing to configure .env
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "BA512PEgF58U0KFjO-I3U_QzUMuSdlr8jQ-yjmwRajadVdefEvx_AkQ75fF30py4g6ILwKfospZ6CR1etUN6vxI";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "Yr7XoQcBuqw3b-mq6seAb0l4ssBjnLW4CB1D3cbw0o8";

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
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return { success: false, error: "Failed to save subscription" };
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
