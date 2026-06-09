"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribePush, unsubscribePush, getPermissionState } from "@/lib/push";

type Settings = {
  notify_messages: boolean;
  notify_likes: boolean;
  notify_comments: boolean;
  notify_follows: boolean;
};

type Props = {
  userId: string;
  onClose: () => void;
};

const ITEMS: { key: keyof Settings; icon: string; label: string }[] = [
  { key: "notify_messages", icon: "💬", label: "DM 메시지" },
  { key: "notify_likes", icon: "❤️", label: "좋아요" },
  { key: "notify_comments", icon: "🗨️", label: "댓글" },
  { key: "notify_follows", icon: "👤", label: "팔로우" },
];

export default function NotificationSettingsSheet({ userId, onClose }: Props) {
  const [permState, setPermState] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    notify_messages: true,
    notify_likes: true,
    notify_comments: true,
    notify_follows: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [subEndpoint, setSubEndpoint] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const perm = await getPermissionState();
      setPermState(perm);

      if (perm === "granted" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          setIsSubscribed(true);
          setSubEndpoint(sub.endpoint);

          const supabase = createClient();
          const { data } = await supabase
            .from("push_subscriptions")
            .select("notify_messages, notify_likes, notify_comments, notify_follows")
            .eq("user_id", userId)
            .eq("endpoint", sub.endpoint)
            .single();
          if (data) setSettings(data as Settings);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [userId]);

  async function handleToggleMain(enabled: boolean) {
    if (enabled) {
      const ok = await subscribePush(userId);
      if (ok) {
        setIsSubscribed(true);
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setSubEndpoint(sub?.endpoint ?? null);
      }
    } else {
      await unsubscribePush(userId);
      setIsSubscribed(false);
      setSubEndpoint(null);
    }
    setPermState(await getPermissionState());
  }

  async function handleToggleItem(key: keyof Settings, value: boolean) {
    if (!subEndpoint) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    const supabase = createClient();
    await supabase
      .from("push_subscriptions")
      .update({ [key]: value })
      .eq("user_id", userId)
      .eq("endpoint", subEndpoint);
  }

  function openSystemSettings() {
    window.open("app-settings:");
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-surface-container rounded-t-2xl border-t border-outline-variant/50 p-5 pb-8">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />
        <h3 className="text-base font-bold text-on-surface mb-4">알림 설정</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : permState === "unsupported" ? (
          <p className="text-sm text-on-surface-variant text-center py-6">
            이 브라우저는 푸시 알림을 지원하지 않아요.
          </p>
        ) : permState === "denied" ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-on-surface-variant text-center leading-relaxed">
              알림이 차단되어 있어요.<br />기기 설정에서 허용해주세요.
            </p>
            <button
              onClick={openSystemSettings}
              className="px-5 py-2.5 bg-surface-tint text-on-primary text-sm font-bold rounded-lg"
            >
              설정 열기
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {/* 전체 알림 토글 */}
            <div className="flex items-center justify-between px-1 py-3 border-b border-outline-variant/30 mb-2">
              <span className="text-sm font-semibold text-on-surface">알림 받기</span>
              <Toggle enabled={isSubscribed} onChange={handleToggleMain} />
            </div>

            {/* 항목별 토글 */}
            {ITEMS.map(({ key, icon, label }) => (
              <div
                key={key}
                className={`flex items-center justify-between px-1 py-3 transition-opacity ${
                  !isSubscribed ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                <span className="text-sm text-on-surface flex items-center gap-2">
                  {icon} {label}
                </span>
                <Toggle
                  enabled={settings[key]}
                  onChange={(v) => handleToggleItem(key, v)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? "bg-surface-tint" : "bg-surface-container-highest"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
