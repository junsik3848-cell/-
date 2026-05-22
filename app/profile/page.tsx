"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { SettingsIcon, LogOutIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

const TABS = [
  { key: "posts", label: "조과 기록" },
  { key: "market", label: "판매 목록" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("username, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const avatarSrc = profile?.avatar_url ?? `https://picsum.photos/seed/${profile?.username ?? "user"}/120/120`;
  const displayName = profile?.username ?? "...";

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="w-10" />
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <main className="pt-14 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center pt-32">
            <div className="w-8 h-8 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* 프로필 헤더 */}
            <div className="px-5 pt-6 pb-4">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-surface-tint/60"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-tint rounded-full flex items-center justify-center text-xs font-bold text-on-primary">
                    ✓
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-bold text-on-surface">{displayName}</h2>
                  {profile?.full_name && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{profile.full_name}</p>
                  )}
                  <div className="flex gap-5 mt-2">
                    <div className="text-center">
                      <p className="text-base font-bold text-on-surface">0</p>
                      <p className="text-xs text-on-surface-variant">조과</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-on-surface">0</p>
                      <p className="text-xs text-on-surface-variant">팔로워</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-on-surface">0</p>
                      <p className="text-xs text-on-surface-variant">팔로잉</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 총 기록 */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "최대 어획", value: "-" },
                  { label: "평균 사이즈", value: "-" },
                  { label: "총 조과", value: "0마리" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-surface-container rounded-lg px-3 py-3 text-center border border-outline-variant/50">
                    <p className="text-sm font-bold text-surface-tint font-brand">{stat.value}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 탭 */}
            <div className="flex border-b border-outline-variant/30">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                    tab === t.key ? "text-surface-tint" : "text-on-surface-variant"
                  }`}
                >
                  {t.label}
                  {tab === t.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-tint" />
                  )}
                </button>
              ))}
            </div>

            {/* 탭 콘텐츠 */}
            {tab === "posts" ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                <p className="text-4xl mb-3">🎣</p>
                <p className="text-sm">아직 조과 기록이 없어요</p>
                <Link href="/post/new" className="inline-block mt-4 text-xs text-surface-tint hover:underline">
                  첫 조과 기록하기
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-sm">등록된 판매 글이 없어요</p>
                <Link href="/post/new" className="inline-block mt-4 text-xs text-surface-tint hover:underline">
                  장터 글 작성하기
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      {/* 설정 드롭다운 */}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowSettings(false)} />
          <div className="fixed top-14 right-4 z-50 max-w-[200px] glass-panel rounded-xl border border-outline-variant/50 py-2 shadow-xl">
            <button className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">
              <SettingsIcon size={16} />알림 설정
            </button>
            <button className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">
              계정 설정
            </button>
            <div className="h-px bg-outline-variant/30 my-1" />
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-error hover:bg-surface-container transition-colors flex items-center gap-3">
              <LogOutIcon size={16} />로그아웃
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
