"use client";

import { use, useState } from "react";
import Link from "next/link";
import { MOCK_POSTS, MOCK_COMMENTS } from "@/lib/mock-data";
import BottomNav from "@/components/BottomNav";
import { ArrowLeftIcon, MoreVerticalIcon, HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon } from "@/components/icons";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const post = MOCK_POSTS.find((p) => p.id === id) ?? MOCK_POSTS[0];
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likes, setLikes] = useState(post.likes);
  const [commentText, setCommentText] = useState("");

  function toggleLike() {
    setIsLiked((v) => !v);
    setLikes((n) => (isLiked ? n - 1 : n + 1));
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/feed" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeftIcon size={22} />
          </Link>
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <MoreVerticalIcon size={22} />
          </button>
        </div>
      </header>

      <main className="pt-14 pb-32">
        {/* 사진 */}
        <div className="relative">
          <img
            src={post.image}
            alt="조과 사진"
            className="w-full aspect-[4/5] object-cover"
          />
          {/* 유저 정보 오버레이 */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.username}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-tint/60"
                />
                <div>
                  <p className="text-white text-sm font-semibold leading-none">{post.user.username}</p>
                  <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                    {post.location}
                  </p>
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-full border border-surface-tint text-surface-tint text-xs font-semibold hover:bg-surface-tint/10 transition-colors">
                팔로우
              </button>
            </div>
          </div>

          {/* 어종 데이터 오버레이 */}
          {post.fish && (
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className="glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-surface-tint flex items-center gap-1.5">
                ⚖ {post.fish.weight}kg
              </span>
              <span className="glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-surface-tint flex items-center gap-1.5">
                📏 {post.fish.length}cm
              </span>
            </div>
          )}
        </div>

        {/* 액션 바 */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-5">
            <button onClick={toggleLike} className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-400" : "text-on-surface-variant"}`}>
              <HeartIcon size={24} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm font-medium">{likes.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-2 text-on-surface-variant">
              <MessageCircleIcon size={24} />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <ShareIcon size={22} />
            </button>
          </div>
          <button className="text-on-surface-variant hover:text-surface-tint transition-colors">
            <BookmarkIcon size={22} fill={post.isBookmarked ? "currentColor" : "none"} className={post.isBookmarked ? "text-surface-tint" : ""} />
          </button>
        </div>

        {/* 캡션 */}
        <div className="px-4 py-3 border-b border-outline-variant/30">
          <p className="text-sm text-on-surface leading-relaxed">
            <span className="font-semibold mr-1.5">{post.user.username}</span>
            {post.caption}
          </p>
          <p className="mt-2 text-xs text-outline">{post.createdAt}</p>
        </div>

        {/* 댓글 목록 */}
        <div className="px-4 py-3 space-y-4">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">댓글 {post.comments}개</p>
          {MOCK_COMMENTS.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user.avatar}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm text-on-surface">
                  <span className="font-semibold mr-1.5">{comment.user.username}</span>
                  {comment.text}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-outline">{comment.createdAt}</span>
                  {comment.likes > 0 && (
                    <span className="text-xs text-outline">좋아요 {comment.likes}개</span>
                  )}
                  <button className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">답글</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 댓글 입력창 */}
      <div className="fixed bottom-16 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-t border-outline-variant/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src="https://picsum.photos/seed/me/40/40"
            alt="나"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글 추가..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
          {commentText && (
            <button className="text-surface-tint text-sm font-semibold hover:text-primary-fixed transition-colors">
              게시
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
