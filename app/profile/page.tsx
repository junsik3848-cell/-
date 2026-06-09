"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { SettingsIcon, LogOutIcon, ShoppingBagIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import NotificationSettingsSheet from "@/components/NotificationSettingsSheet";
import { registerServiceWorker } from "@/lib/push";

type UserProfile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

type CatchPost = {
  id: string;
  images: string[];
  weight: number | null;
  length: number | null;
  location: string | null;
  created_at: string;
};

type MarketPost = {
  id: string;
  images: string[];
  title: string | null;
  price: number | null;
  category: string | null;
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
  const [catchPosts, setCatchPosts] = useState<CatchPost[]>([]);
  const [marketPosts, setMarketPosts] = useState<MarketPost[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [
        { data: profileData },
        { data: catchData },
        { data: marketData },
        { count: followers },
        { count: following },
      ] = await Promise.all([
        supabase.from("users").select("id, username, full_name, avatar_url").eq("id", user.id).single(),
        supabase.from("posts").select("id, images, weight, length, location, created_at").eq("user_id", user.id).eq("type", "catch").order("created_at", { ascending: false }),
        supabase.from("posts").select("id, images, title, price, category").eq("user_id", user.id).eq("type", "market").order("created_at", { ascending: false }),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user.id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id),
      ]);

      if (profileData) setProfile(profileData as UserProfile);
      setCatchPosts((catchData ?? []) as CatchPost[]);
      setMarketPosts((marketData ?? []) as MarketPost[]);
      setFollowerCount(followers ?? 0);
      setFollowingCount(following ?? 0);
      setIsLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploadingAvatar(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsUploadingAvatar(false); return; }

    const compressed = await compressImage(file, "avatar");
    const path = `${user.id}/avatar.jpg`;
    const { error } = await supabase.storage.from("avatars").upload(path, compressed, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("users").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      setProfile((prev) => prev ? { ...prev, avatar_url: data.publicUrl } : prev);
    }
    setIsUploadingAvatar(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const maxLength = catchPosts.filter((p) => p.length).length > 0
    ? Math.max(...catchPosts.map((p) => p.length ?? 0))
    : null;

  const avatarSrc = profile?.avatar_url ?? `https://picsum.photos/seed/${profile?.username ?? "user"}/120/120`;
  const displayName = profile?.username ?? "...";

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
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
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {showAvatarMenu && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowAvatarMenu(false)} />
                  )}
                  <button
                    onClick={() => setShowAvatarMenu((v) => !v)}
                    className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-surface-tint/60 block"
                  >
                    {isUploadingAvatar ? (
                      <div className="w-full h-full bg-surface-container flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                    )}
                  </button>
                  {showAvatarMenu && (
                    <button
                      onClick={() => { setShowAvatarMenu(false); avatarInputRef.current?.click(); }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap text-xs font-semibold text-surface-tint bg-surface-container border border-outline-variant/50 rounded-full px-3 py-1.5 shadow-lg"
                    >
                      프로필 사진 추가
                    </button>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-tint rounded-full flex items-center justify-center text-xs font-bold text-on-primary pointer-events-none">
                    ✓
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-bold text-on-surface text-center">{displayName}</h2>
                  <div className="flex mt-3">
                    <div className="flex-1 text-center">
                      <p className="text-xl font-bold text-on-surface">{catchPosts.length}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">조과</p>
                    </div>
                    <Link href={`/profile/${profile?.id}/followers`} className="flex-1 text-center border-x border-outline-variant/40">
                      <p className="text-xl font-bold text-on-surface">{followerCount}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">팔로워</p>
                    </Link>
                    <Link href={`/profile/${profile?.id}/following`} className="flex-1 text-center">
                      <p className="text-xl font-bold text-on-surface">{followingCount}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">팔로잉</p>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 통계 카드 */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: "최대 사이즈", value: maxLength ? `${maxLength}cm` : "-" },
                  { label: "총 조과", value: `${catchPosts.length}마리` },
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
              catchPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                  <p className="text-4xl mb-3">🎣</p>
                  <p className="text-sm">아직 조과 기록이 없어요</p>
                  <Link href="/post/new?type=catch" className="inline-block mt-4 text-xs text-surface-tint hover:underline">
                    첫 조과 기록하기
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5">
                  {catchPosts.map((p) => (
                    <Link key={p.id} href={`/post/${p.id}`} className="relative aspect-square block">
                      <img
                        src={p.images[0] ?? "https://picsum.photos/seed/empty/200/200"}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-1 right-1 text-[10px] font-medium text-white bg-black/50 rounded px-1">
                        {new Date(p.created_at).toLocaleDateString("ko-KR", { year: "2-digit", month: "numeric", day: "numeric" }).replace(/\.$/, "")}
                      </span>
                      {(p.weight || p.length) && (
                        <div className="absolute bottom-1 left-1 flex gap-1">
                          {p.weight && (
                            <span className="text-[10px] font-bold text-white bg-black/50 rounded px-1">{p.weight}kg</span>
                          )}
                          {p.length && (
                            <span className="text-[10px] font-bold text-white bg-black/50 rounded px-1">{p.length}cm</span>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )
            ) : (
              marketPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant">
                  <ShoppingBagIcon size={28} className="mb-2 text-outline" />
                  <p className="text-xs">등록된 판매 글이 없어요</p>
                  <Link href="/post/new?type=market" className="inline-block mt-3 text-xs text-surface-tint hover:underline">
                    장터 글 작성하기
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/30">
                  {marketPosts.map((p) => (
                    <Link key={p.id} href={`/market/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors">
                      <img
                        src={p.images[0] ?? "https://picsum.photos/seed/empty/80/80"}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{p.title ?? "제목 없음"}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{p.category}</p>
                        <p className="text-sm font-bold text-surface-tint mt-1">
                          {p.price != null ? `${p.price.toLocaleString()}원` : "가격 미정"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* 설정 드롭다운 */}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowSettings(false)} />
          <div className="fixed top-14 right-4 z-50 max-w-[200px] glass-panel rounded-xl border border-outline-variant/50 py-2 shadow-xl">
            <button
              onClick={() => { setShowSettings(false); setShowNotifSettings(true); }}
              className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3"
            >
              <SettingsIcon size={16} />알림 설정
            </button>
            <button className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">
              계정 설정
            </button>
            <Link
              href="/privacy"
              onClick={() => setShowSettings(false)}
              className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3"
            >
              개인정보처리방침
            </Link>
            <div className="h-px bg-outline-variant/30 my-1" />
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-error hover:bg-surface-container transition-colors flex items-center gap-3">
              <LogOutIcon size={16} />로그아웃
            </button>
          </div>
        </>
      )}

      {showNotifSettings && profile && (
        <NotificationSettingsSheet
          userId={profile.id}
          onClose={() => setShowNotifSettings(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}
