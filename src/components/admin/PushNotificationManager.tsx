"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker, subscribeUser, getSubscription } from "@/utils/push";
import { savePushSubscription } from "@/actions/push";
import { Bell, BellOff, Loader2 } from "lucide-react";

interface Props {
  tenantId: string;
  variant?: "icon" | "button";
}

export default function PushNotificationManager({ tenantId, variant = "icon" }: Props) {
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
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BJVb7S3LDy77F17_7U3-GUKRamS8nrho-86psTOFQ7wxwoLrQdi40zDizEJuzA4rGfGx8h_z8sFZ-5dndI8sKuY";
      
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
      const errorMsg = error.message?.toLowerCase() || "";
      if (errorMsg === "vapid_key_missing") {
        alert("Lỗi hệ thống: Chưa cấu hình VAPID Key trên Server (Vercel). Vui lòng thêm biến NEXT_PUBLIC_VAPID_PUBLIC_KEY vào môi trường.");
      } else if (errorMsg === "permission denied") {
        alert("Vui lòng cấp quyền gửi thông báo trong cài đặt trình duyệt của bạn.");
      } else if (errorMsg.includes("push service not available") || errorMsg.includes("registration failed")) {
        alert("Trình duyệt này không hỗ trợ nhận thông báo Push (Push Service Not Available).\n\n• Trên iOS/iPhone: Vui lòng 'Thêm vào màn hình chính' (Add to Home Screen) rồi mở từ màn hình chính để bật thông báo.\n• Trên PC: Vui lòng sử dụng Google Chrome hoặc Edge.");
      } else {
        alert("Lỗi: " + (error.message || JSON.stringify(error)));
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) return null;

  if (variant === "button") {
    return (
      <button
        onClick={isSubscribed ? undefined : handleSubscribe}
        disabled={isSubscribed}
        className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between text-left ${
          isSubscribed 
            ? "bg-green-50 border-green-200 text-green-700 cursor-default" 
            : "bg-white border-primary/20 hover:border-primary hover:bg-primary/5 cursor-pointer shadow-sm text-gray-900"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSubscribed ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
          }`}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Bell size={20} />}
          </div>
          <div>
            <h4 className="font-bold">Push Notifications</h4>
            <p className={`text-xs ${isSubscribed ? "text-green-600" : "text-gray-500"}`}>
              {isSubscribed ? "Đã bật thông báo trên thiết bị này" : "Nhận thông báo khi có lịch đặt mới"}
            </p>
          </div>
        </div>
        {!isSubscribed && !isLoading && (
          <div className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg">
            Bật ngay
          </div>
        )}
      </button>
    );
  }

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
