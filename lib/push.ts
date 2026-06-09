import { createClient } from "@/lib/supabase/client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function getPermissionState(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function subscribePush(userId: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub = existing ?? await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const supabase = createClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: userId, endpoint: sub.endpoint, subscription: sub.toJSON() },
    { onConflict: "user_id,endpoint" }
  );

  return !error;
}

export async function unsubscribePush(userId: string): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
    const supabase = createClient();
    await supabase.from("push_subscriptions").delete()
      .eq("user_id", userId)
      .eq("endpoint", sub.endpoint);
  }
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch {
    // 등록 실패는 무시
  }
}
