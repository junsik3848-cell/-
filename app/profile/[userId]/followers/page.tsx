"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type UserRow = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export default function FollowersPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const [followers, setFollowers] = useState<UserRow[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myFollowingIds, setMyFollowingIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const me = user?.id ?? null;
      setMyUserId(me);

      const { data: followRows } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

      const ids = (followRows ?? []).map((r: { follower_id: string }) => r.follower_id);

      if (ids.length === 0) { setIsLoading(false); return; }

      const { data: users } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .in("id", ids);

      setFollowers((users ?? []) as UserRow[]);

      if (me) {
        const { data: myFollows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", me)
          .in("following_id", ids);
        setMyFollowingIds(new Set((myFollows ?? []).map((r: { following_id: string }) => r.following_id)));
      }

      setIsLoading(false);
    }
    load();
  }, [userId]);

  async function toggleFollow(targetId: string) {
    if (!myUserId) { router.push("/login"); return; }
    const supabase = createClient();
    setLoadingIds((s) => new Set(s).add(targetId));
    if (myFollowingIds.has(targetId)) {
      await supabase.from("follows").delete().eq("follower_id", myUserId).eq("following_id", targetId);
      setMyFollowingIds((s) => { const n = new Set(s); n.delete(targetId); return n; });
    } else {
      await supabase.from("follows").insert({ follower_id: myUserId, following_id: targetId });
      setMyFollowingIds((s) => new Set(s).add(targetId));
    }
    setLoadingIds((s) => { const n = new Set(s); n.delete(targetId); return n; });
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeftIcon size={22} />
          </button>
          <h1 className="text-base font-bold text-on-surface">팔로워</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pt-14">
        {isLoading ? (
          <div className="flex justify-center pt-32">
            <div className="w-8 h-8 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : followers.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-32 text-on-surface-variant">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm">아직 팔로워가 없어요</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {followers.map((u) => {
              const isMe = u.id === myUserId;
              const isFollowing = myFollowingIds.has(u.id);
              const isLoading = loadingIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/profile/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={u.avatar_url ?? `https://picsum.photos/seed/${u.username}/80/80`}
                      alt={u.username}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="text-sm font-semibold text-on-surface truncate">{u.username}</span>
                  </Link>
                  {!isMe && (
                    <button
                      onClick={() => toggleFollow(u.id)}
                      disabled={isLoading}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all disabled:opacity-50 ${
                        isFollowing
                          ? "border border-outline-variant text-on-surface-variant"
                          : "bg-surface-tint text-on-primary"
                      }`}
                    >
                      {isFollowing ? "팔로잉" : "팔로우"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
