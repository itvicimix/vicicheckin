import { PrismaClient } from "@prisma/client";
import webpush from "web-push";

const prisma = new PrismaClient();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "BA512PEgF58U0KFjO-I3U_QzUMuSdlr8jQ-yjmwRajadVdefEvx_AkQ75fF30py4g6ILwKfospZ6CR1etUN6vxI";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "Yr7XoQcBuqw3b-mq6seAb0l4ssBjnLW4CB1D3cbw0o8";

webpush.setVapidDetails(
  "mailto:admin@vicicheckin.com",
  vapidPublicKey,
  vapidPrivateKey
);

async function testPush() {
  const subs = await prisma.pushSubscription.findMany();
  console.log("Found subscriptions:", subs.length);

  if (subs.length === 0) {
    console.log("No subscriptions found in the database. Cannot send test push.");
    return;
  }

  const payload = JSON.stringify({
    title: "Test Notification",
    body: "This is a test notification from the server",
    url: "/"
  });

  for (const sub of subs) {
    try {
      console.log(`Sending to ${sub.endpoint.substring(0, 50)}...`);
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      }, payload);
      console.log("Success!");
    } catch (e: any) {
      console.error("Failed:", e.statusCode, e.body);
    }
  }
}

testPush().catch(console.error);
