"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ImageCarousel from "@/components/ImageCarousel";
import { ArrowLeftIcon, MoreVerticalIcon, HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type PostDetail = {
  id: string;
  user_id: string;
  type: string;
  images: string[];
  caption: string | null;
  location: string | null;
  weight: number | null;
  length: number | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  users: { username: string; avatar_url: string | null };
};

type Comment = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  users: { username: string; avatar_url: string | null };
};

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [{ data: { user } }, { data: postData }, ] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("posts")
          .select("*, users(username, avatar_url)")
          .eq("id", id)
          .single(),
      ]);

      if (!postData) { router.push("/feed"); return; }
      setPost(postData as PostDetail);
      setLikesCount(postData.likes_count ?? 0);

      if (user) {
        setMyUserId(user.id);

        const [{ data: myProfile }, { data: likeRow }, { data: bookmarkRow }, { data: commentRows }] = await Promise.all([
          supabase.from("users").select("avatar_url").eq("id", user.id).single(),
          supabase.from("likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle(),
          supabase.from("bookmarks").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle(),
          supabase
            .from("comments")
            .select("id, user_id, text, created_at, users(username, avatar_url)")
            .eq("post_id", id)
            .order("created_at", { ascending: true }),
        ]);

        setMyAvatar(myProfile?.avatar_url ?? null);
        setIsLiked(!!likeRow);
        setIsBookmarked(!!bookmarkRow);
        setComments((commentRows ?? []) as unknown as Comment[]);
      } else {
        const { data: commentRows } = await supabase
          .from("comments")
          .select("id, user_id, text, created_at, users(username, avatar_url)")
          .eq("post_id", id)
          .order("created_at", { ascending: true });
        setComments((commentRows ?? []) as unknown as Comment[]);
      }

      setIsLoading(false);
    }
    load();
  }, [id, router]);

  async function toggleLike() {
    if (!myUserId) { router.push("/login"); return; }
    const supabase = createClient();
    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id", id).eq("user_id", myUserId);
      setIsLiked(false);
      setLikesCount((n) => Math.max(n - 1, 0));
    } else {
      await supabase.from("likes").insert({ post_id: id, user_id: myUserId });
      setIsLiked(true);
      setLikesCount((n) => n + 1);
    }
  }

  async function toggleBookmark() {
    if (!myUserId) { router.push("/login"); return; }
    const supabase = createClient();
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("post_id", id).eq("user_id", myUserId);
      setIsBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({ post_id: id, user_id: myUserId });
      setIsBookmarked(true);
    }
  }

  async function handleDelete() {
    if (!myUserId || myUserId !== post?.user_id) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", id).eq("user_id", myUserId);
    router.push("/feed");
  }

  async function submitComment() {
    if (!commentText.trim() || isSubmitting) return;
    if (!myUserId) { router.push("/login"); return; }
    setIsSubmitting(true);
    const supabase = createClient();
    const { data: newComment } = await supabase
      .from("comments")
      .insert({ post_id: id, user_id: myUserId, text: commentText.trim() })
      .select("id, user_id, text, created_at, users(username, avatar_url)")
      .single();
    if (newComment) {
      setComments((prev) => [...prev, newComment as unknown as Comment]);
    }
    setCommentText("");
    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  const authorAvatar = post.users.avatar_url ?? `https://picsum.photos/seed/${post.users.username}/80/80`;

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/feed" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeftIcon size={22} />
          </Link>
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <MoreVerticalIcon size={22} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-11 z-50 w-44 glass-panel rounded-xl border border-outline-variant/50 py-1 shadow-xl">
                  {myUserId === post?.user_id && (
                    <button
                      onClick={() => { setShowMenu(false); handleDelete(); }}
                      className="w-full text-left px-4 py-3 text-sm text-error hover:bg-surface-container transition-colors"
                    >
                      게시글 삭제하기
                    </button>
                  )}
                  {myUserId !== post?.user_id && (
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full text-left px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      신고하기
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-14 pb-32">
        {/* 사진 */}
        <div className="relative">
          <ImageCarousel images={post.images.length > 0 ? post.images : ["https://picsum.photos/seed/empty/400/500"]} />
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={authorAvatar}
                  alt={post.users.username}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-tint/60"
                />
                <div>
                  <p className="text-white text-sm font-semibold leading-none">{post.users.username}</p>
                  {post.location && (
                    <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                      {post.location}
                    </p>
                  )}
                </div>
              </div>
              <FollowButton postUserId={post.user_id} myUserId={myUserId} />
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

        {/* 액션 바 */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-5">
            <button onClick={toggleLike} className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-400" : "text-on-surface-variant"}`}>
              <HeartIcon size={24} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm font-medium">{likesCount.toLocaleString()}</span>
            </button>
            <button
              onClick={() => commentInputRef.current?.focus()}
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <MessageCircleIcon size={24} />
              <span className="text-sm font-medium">{comments.length}</span>
            </button>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <ShareIcon size={22} />
            </button>
          </div>
          <button
            onClick={toggleBookmark}
            className={`transition-colors ${isBookmarked ? "text-surface-tint" : "text-on-surface-variant hover:text-surface-tint"}`}
          >
            <BookmarkIcon size={22} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* 캡션 */}
        <div className="px-4 py-3 border-b border-outline-variant/30">
          <p className="text-sm text-on-surface leading-relaxed">
            <Link href={`/profile/${post.user_id}`} className="font-semibold hover:text-surface-tint transition-colors mr-1.5">
              {post.users.username}
            </Link>
            {post.caption}
          </p>
          <p className="mt-2 text-xs text-outline">
            {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>

        {/* 댓글 목록 */}
        <div className="px-4 py-3 space-y-4">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            댓글 {comments.length}개
          </p>
          {comments.length === 0 && (
            <p className="text-xs text-outline text-center py-4">첫 댓글을 남겨보세요</p>
          )}
          {comments.map((comment) => {
            const avatar = comment.users.avatar_url ?? `https://picsum.photos/seed/${comment.users.username}/40/40`;
            return (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={avatar}
                  alt={comment.users.username}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm text-on-surface">
                    <Link href={`/profile/${comment.user_id}`} className="font-semibold hover:text-surface-tint transition-colors mr-1.5">
                      {comment.users.username}
                    </Link>
                    {comment.text}
                  </p>
                  <span className="text-xs text-outline mt-1 block">
                    {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 댓글 입력창 */}
      <div className="fixed bottom-16 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-t border-outline-variant/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={myAvatar ?? `https://picsum.photos/seed/me/40/40`}
            alt="나"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <input
            ref={commentInputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            placeholder="댓글 추가..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
          {commentText.trim() && (
            <button
              onClick={submitComment}
              disabled={isSubmitting}
              className="text-surface-tint text-sm font-semibold hover:text-primary-fixed transition-colors disabled:opacity-50"
            >
              게시
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function FollowButton({ postUserId, myUserId }: { postUserId: string; myUserId: string | null }) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!myUserId || myUserId === postUserId) { setIsLoaded(true); return; }
    const supabase = createClient();
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", myUserId)
      .eq("following_id", postUserId)
      .maybeSingle()
      .then(({ data }) => {
        setIsFollowing(!!data);
        setIsLoaded(true);
      });
  }, [myUserId, postUserId]);

  if (!isLoaded || myUserId === postUserId) return null;

  async function toggle() {
    if (!myUserId) { router.push("/login"); return; }
    const supabase = createClient();
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", myUserId).eq("following_id", postUserId);
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: myUserId, following_id: postUserId });
      setIsFollowing(true);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
        isFollowing
          ? "border-outline-variant text-on-surface-variant hover:border-error hover:text-error"
          : "border-surface-tint text-surface-tint hover:bg-surface-tint/10"
      }`}
    >
      {isFollowing ? "팔로잉" : "팔로우"}
    </button>
  );
}
