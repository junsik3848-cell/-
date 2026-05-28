"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ImageCarousel from "@/components/ImageCarousel";
import { BellIcon, HeartIcon, MessageCircleIcon, BookmarkIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 10;

type FeedPost = {
  id: string;
  user_id: string;
  images: string[];
  caption: string | null;
  location: string | null;
  weight: number | null;
  length: number | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  users: { username: string; avatar_url: string | null };
  isLiked: boolean;
  isBookmarked: boolean;
};

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const myUserIdRef = useRef<string | null>(null);

  const loadPosts = useCallback(async (offset: number) => {
    const supabase = createClient();
    const { data: rawPosts } = await supabase
      .from("posts")
      .select("id, user_id, images, caption, location, weight, length, likes_count, comments_count, created_at, users(username, avatar_url)")
      .eq("type", "catch")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (!rawPosts || rawPosts.length === 0) {
      setHasMore(false);
      return;
    }

    if (rawPosts.length < PAGE_SIZE) setHasMore(false);

    const userId = myUserIdRef.current;
    let likedIds = new Set<string>();
    let bookmarkedIds = new Set<string>();

    if (userId) {
      const postIds = rawPosts.map((p) => p.id);
      const [{ data: likeRows }, { data: bookmarkRows }] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
        supabase.from("bookmarks").select("post_id").eq("user_id", userId).in("post_id", postIds),
      ]);
      likedIds = new Set((likeRows ?? []).map((r: { post_id: string }) => r.post_id));
      bookmarkedIds = new Set((bookmarkRows ?? []).map((r: { post_id: string }) => r.post_id));
    }

    const newPosts = rawPosts
      .filter((p) => p.users != null)
      .map((p) => ({
        ...p,
        users: p.users as unknown as { username: string; avatar_url: string | null },
        isLiked: likedIds.has(p.id),
        isBookmarked: bookmarkedIds.has(p.id),
      }));

    setPosts((prev) => offset === 0 ? newPosts : [...prev, ...newPosts]);
    offsetRef.current = offset + rawPosts.length;
  }, []);

  // 초기 로드
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      myUserIdRef.current = user?.id ?? null;
      setMyUserId(user?.id ?? null);
      await loadPosts(0);
      setIsLoading(false);
    }
    init();
  }, [loadPosts]);

  // 무한 스크롤 — sentinel이 뷰포트에 들어오면 다음 페이지 로드
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          setIsLoadingMore(true);
          await loadPosts(offsetRef.current);
          setIsLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoadingMore, hasMore, loadPosts]);

  async function toggleLike(postId: string) {
    if (!myUserId) { router.push("/login"); return; }
    const supabase = createClient();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.isLiked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", myUserId);
      setPosts((prev) => prev.map((p) => p.id === postId
        ? { ...p, isLiked: false, likes_count: Math.max(p.likes_count - 1, 0) }
        : p
      ));
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: myUserId });
      setPosts((prev) => prev.map((p) => p.id === postId
        ? { ...p, isLiked: true, likes_count: p.likes_count + 1 }
        : p
      ));
    }
  }

  async function toggleBookmark(postId: string) {
    if (!myUserId) { router.push("/login"); return; }
    const supabase = createClient();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.isBookmarked) {
      await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", myUserId);
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isBookmarked: false } : p));
    } else {
      await supabase.from("bookmarks").insert({ post_id: postId, user_id: myUserId });
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isBookmarked: true } : p));
    }
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="w-10" />
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <BellIcon size={22} />
          </button>
        </div>
      </header>

      <main className="pt-14 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center pt-32">
            <div className="w-8 h-8 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-32 text-on-surface-variant">
            <p className="text-5xl mb-4">🎣</p>
            <p className="text-sm font-medium">아직 게시글이 없어요</p>
            <p className="text-xs mt-1 text-outline">첫 조과를 기록해보세요!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => toggleLike(post.id)}
                onBookmark={() => toggleBookmark(post.id)}
              />
            ))}

            {/* 무한 스크롤 sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {isLoadingMore && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-center text-xs text-outline py-6">모든 게시글을 불러왔어요</p>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function PostCard({
  post,
  onLike,
  onBookmark,
}: {
  post: FeedPost;
  onLike: () => void;
  onBookmark: () => void;
}) {
  const avatar = post.users?.avatar_url ?? `https://picsum.photos/seed/${post.users?.username ?? "user"}/80/80`;

  return (
    <article className="border-b border-outline-variant/30">
      <div className="relative">
        <Link href={`/post/${post.id}`} className="block">
          <ImageCarousel images={post.images.length > 0 ? post.images : ["https://picsum.photos/seed/empty/400/500"]} />
        </Link>

        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-2.5">
            <Link href={`/profile/${post.user_id}`}>
              <img
                src={avatar}
                alt={post.users?.username}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-tint/60"
              />
            </Link>
            <div className="pointer-events-none">
              <p className="text-white text-sm font-semibold leading-none">{post.users?.username}</p>
              {post.location && (
                <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {post.location}
                </p>
              )}
              <p className="text-white/60 text-xs mt-0.5">
                {new Date(post.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
        </div>

        {(post.weight || post.length) && (
          <div className="absolute bottom-10 left-3 flex gap-2 pointer-events-none">
            {post.weight && (
              <span className="glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-surface-tint flex items-center gap-1.5">
                ⚖ {post.weight}kg
              </span>
            )}
            {post.length && (
              <span className="glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-surface-tint flex items-center gap-1.5">
                📏 {post.length}cm
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-surface-container-low">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 transition-colors ${
                post.isLiked ? "text-red-400" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <HeartIcon size={22} fill={post.isLiked ? "currentColor" : "none"} />
              <span className="text-xs font-medium">{post.likes_count.toLocaleString()}</span>
            </button>
            <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors">
              <MessageCircleIcon size={22} />
              <span className="text-xs font-medium">{post.comments_count}</span>
            </Link>
          </div>
          <button
            onClick={onBookmark}
            className={`transition-colors ${
              post.isBookmarked ? "text-surface-tint" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <BookmarkIcon size={22} fill={post.isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="text-sm text-on-surface leading-relaxed">
          {post.caption}
        </p>

        {post.comments_count > 0 && (
          <Link href={`/post/${post.id}`} className="block mt-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            댓글 {post.comments_count}개 모두 보기
          </Link>
        )}

      </div>
    </article>
  );
}
