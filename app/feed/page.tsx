"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { BellIcon, HeartIcon, MessageCircleIcon, BookmarkIcon } from "@/components/icons";
import { MOCK_POSTS, type Post } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

type RealPost = {
  id: string;
  user_id: string;
  type: string;
  images: string[];
  caption: string | null;
  location: string | null;
  weight: number | null;
  length: number | null;
  created_at: string;
  users: { username: string; avatar_url: string | null };
};

function toFeedPost(p: RealPost): Post & { _real?: boolean } {
  return {
    id: p.id,
    user: {
      id: p.user_id,
      username: p.users.username,
      avatar: p.users.avatar_url ?? `https://picsum.photos/seed/${p.users.username}/80/80`,
    },
    image: p.images[0] ?? "https://picsum.photos/seed/empty/400/500",
    location: p.location ?? "",
    fish: p.weight || p.length ? { weight: p.weight ?? 0, length: p.length ?? 0 } : null,
    caption: p.caption ?? "",
    hashtags: [],
    likes: 0,
    comments: 0,
    createdAt: new Date(p.created_at).toLocaleDateString("ko-KR"),
    isLiked: false,
    isBookmarked: false,
    _real: true,
  };
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  useEffect(() => {
    async function loadRealPosts() {
      const supabase = createClient();
      const { data } = await supabase
        .from("posts")
        .select("*, users(username, avatar_url)")
        .eq("type", "catch")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const realPosts = (data as RealPost[]).map(toFeedPost);
        setPosts([...realPosts, ...MOCK_POSTS]);
      }
    }
    loadRealPosts();
  }, []);

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  function toggleBookmark(id: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="w-10" />
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <BellIcon size={22} />
          </button>
        </div>
      </header>

      <main className="pt-14 pb-20">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => toggleLike(post.id)}
            onBookmark={() => toggleBookmark(post.id)}
          />
        ))}
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
  post: Post;
  onLike: () => void;
  onBookmark: () => void;
}) {
  return (
    <article className="border-b border-outline-variant/30">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Link href={`/post/${post.id}`}>
          <img src={post.image} alt="조과 사진" className="w-full h-full object-cover" />
        </Link>

        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-2.5">
            <img
              src={post.user.avatar}
              alt={post.user.username}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-tint/60"
            />
            <div>
              <p className="text-white text-sm font-semibold leading-none">{post.user.username}</p>
              {post.location && (
                <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {post.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {post.fish && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-surface-tint flex items-center gap-1.5">
              <span>⚖</span>{post.fish.weight}kg
            </span>
            <span className="glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-surface-tint flex items-center gap-1.5">
              <span>📏</span>{post.fish.length}cm
            </span>
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
              <span className="text-xs font-medium">{post.likes.toLocaleString()}</span>
            </button>
            <Link href={`/post/${post.id}`} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <MessageCircleIcon size={22} />
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
          <Link href="/profile" className="font-semibold hover:text-surface-tint transition-colors mr-1.5">
            {post.user.username}
          </Link>
          {post.caption}
        </p>

        {post.comments > 0 && (
          <Link href={`/post/${post.id}`} className="block mt-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            댓글 {post.comments}개 모두 보기
          </Link>
        )}

        <p className="mt-1 text-[11px] text-outline">{post.createdAt}</p>
      </div>
    </article>
  );
}
