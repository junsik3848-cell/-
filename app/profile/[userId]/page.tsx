"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ArrowLeftIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

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
};

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [catchPosts, setCatchPosts] = useState<CatchPost[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [
        { data: { user } },
        { data: profileData },
        { data: catchData },
        { count: followers },
        { count: following },
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("users").select("id, username, full_name, avatar_url").eq("id", userId).single(),
        supabase.from("posts").select("id, images, weight, length").eq("user_id", userId).eq("type", "catch").order("created_at", { ascending: false }),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
      ]);

      if (!profileData) { router.push("/feed"); return; }

      setProfile(profileData as UserProfile);
      setCatchPosts((catchData ?? []) as CatchPost[]);
      setFollowerCount(followers ?? 0);
      setFollowingCount(following ?? 0);

      if (user) {
        setMyUserId(user.id);
        if (user.id !== userId) {
          const { data: followRow } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", userId)
            .maybeSingle();
          setIsFollowing(!!followRow);
        }
      }

      setIsLoading(false);
    }
    load();
  }, [userId, router]);

  async function toggleFollow() {
    if (!myUserId) { router.push("/login"); return; }
    setIsFollowLoading(true);
    const supabase = createClient();
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", myUserId).eq("following_id", userId);
      setIsFollowing(false);
      setFollowerCount((n) => Math.max(n - 1, 0));
    } else {
      await supabase.from("follows").insert({ follower_id: myUserId, following_id: userId });
      setIsFollowing(true);
      setFollowerCount((n) => n + 1);
    }
    setIsFollowLoading(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const avatarSrc = profile.avatar_url ?? `https://picsum.photos/seed/${profile.username}/120/120`;
  const isMyProfile = myUserId === userId;

  const maxWeight = catchPosts.length > 0 ? Math.max(...catchPosts.map((p) => p.weight ?? 0)) : null;
  const avgLength = catchPosts.filter((p) => p.length).length > 0
    ? catchPosts.reduce((s, p) => s + (p.length ?? 0), 0) / catchPosts.filter((p) => p.length).length
    : null;

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeftIcon size={22} />
          </button>
          <h1 className="text-base font-bold text-on-surface">{profile.username}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pt-14 pb-20">
        {/* 프로필 헤더 */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-5">
            <img
              src={avatarSrc}
              alt={profile.username}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-surface-tint/60"
            />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-on-surface">{profile.username}</h2>
              {profile.full_name && (
                <p className="text-xs text-on-surface-variant mt-0.5">{profile.full_name}</p>
              )}
              <div className="flex gap-5 mt-2">
                <div className="text-center">
                  <p className="text-base font-bold text-on-surface">{catchPosts.length}</p>
                  <p className="text-xs text-on-surface-variant">조과</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-on-surface">{followerCount}</p>
                  <p className="text-xs text-on-surface-variant">팔로워</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-on-surface">{followingCount}</p>
                  <p className="text-xs text-on-surface-variant">팔로잉</p>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "최대 어획", value: maxWeight ? `${maxWeight}kg` : "-" },
              { label: "평균 사이즈", value: avgLength ? `${avgLength.toFixed(1)}cm` : "-" },
              { label: "총 조과", value: `${catchPosts.length}마리` },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-container rounded-lg px-3 py-3 text-center border border-outline-variant/50">
                <p className="text-sm font-bold text-surface-tint font-brand">{stat.value}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 팔로우 버튼 */}
          {!isMyProfile && (
            <button
              onClick={toggleFollow}
              disabled={isFollowLoading}
              className={`mt-4 w-full h-11 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                isFollowing
                  ? "border border-outline-variant text-on-surface-variant hover:border-error hover:text-error"
                  : "bg-surface-tint text-on-primary glow-mint hover:bg-primary-fixed"
              }`}
            >
              {isFollowLoading ? "..." : isFollowing ? "팔로잉" : "팔로우"}
            </button>
          )}
          {isMyProfile && (
            <Link
              href="/profile"
              className="mt-4 w-full h-11 rounded-xl text-sm font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
            >
              프로필 편집
            </Link>
          )}
        </div>

        {/* 조과 그리드 */}
        <div className="border-t border-outline-variant/30">
          {catchPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <p className="text-4xl mb-3">🎣</p>
              <p className="text-sm">아직 조과 기록이 없어요</p>
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
                  {p.weight && (
                    <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 rounded px-1">
                      {p.weight}kg
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
