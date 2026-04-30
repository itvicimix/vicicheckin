"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker, subscribeUser, getSubscription } from "@/utils/push";
import { savePushSubscription } from "@/actions/push";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function PushNotificationManager({ tenantId }: { tenantId: string }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await getSubscription(registration);
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubscribe() {
    setIsLoading(true);
    try {
      // 1. Request permission first
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permission denied");
      }

      const registration = await registerServiceWorker();
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!publicVapidKey) {
        throw new Error("VAPID_KEY_MISSING");
      }

      const subscription = await subscribeUser(registration, publicVapidKey);
      
      if (subscription) {
        const result = await savePushSubscription(tenantId, subscription.toJSON());
        if (result.success) {
          setIsSubscribed(true);
        } else {
          alert("Failed to save subscription on server");
        }
      }
    } catch (error: any) {
      console.error("Error subscribing:", error);
      if (error.message === "VAPID_KEY_MISSING") {
        alert("Lỗi hệ thống: Chưa cấu hình VAPID Key trên Server (Vercel). Vui lòng thêm biến NEXT_PUBLIC_VAPID_PUBLIC_KEY vào môi trường.");
      } else if (error.message === "Permission denied") {
        alert("Vui lòng cấp quyền gửi thông báo trong cài đặt trình duyệt của bạn.");
      } else {
        alert("Không thể đăng ký nhận thông báo. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <button
      onClick={isSubscribed ? undefined : handleSubscribe}
      className={`p-2 rounded-full transition-colors ${
        isSubscribed 
          ? "bg-green-100 text-green-600 cursor-default" 
          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
      }`}
      title={isSubscribed ? "Notifications enabled" : "Enable notifications"}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="h-5 w-5" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}
    </button>
  );
}
