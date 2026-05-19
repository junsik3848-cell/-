"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { SettingsIcon, LogOutIcon } from "@/components/icons";
import { MOCK_POSTS, MOCK_MARKET_POSTS } from "@/lib/mock-data";

const ME = {
  username: "bass_hunter_99",
  bio: "충주호 베이스캠프 🎣 텍사스 & 캐롤라이나 리그 전문",
  avatar: "https://picsum.photos/seed/user1/120/120",
  followers: 1284,
  following: 392,
  posts: MOCK_POSTS.filter((p) => p.user.username === "bass_hunter_99"),
  marketPosts: MOCK_MARKET_POSTS.filter((p) => p.user.username === "bass_hunter_99"),
};

const TABS = [
  { key: "posts", label: "조과 기록" },
  { key: "market", label: "판매 목록" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);

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
        {/* 프로필 헤더 */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={ME.avatar}
                alt={ME.username}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-surface-tint/60"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-tint rounded-full flex items-center justify-center text-xs font-bold text-on-primary">
                ✓
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-on-surface">{ME.username}</h2>
              <div className="flex gap-5 mt-2">
                <div className="text-center">
                  <p className="text-base font-bold text-on-surface">{ME.posts.length + 3}</p>
                  <p className="text-xs text-on-surface-variant">조과</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-on-surface">{ME.followers.toLocaleString()}</p>
                  <p className="text-xs text-on-surface-variant">팔로워</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-on-surface">{ME.following}</p>
                  <p className="text-xs text-on-surface-variant">팔로잉</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-on-surface leading-relaxed">{ME.bio}</p>

          {/* 총 기록 */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "최대 어획", value: "3.8kg" },
              { label: "평균 사이즈", value: "52cm" },
              { label: "총 조과", value: `${ME.posts.length + 3}마리` },
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
          <div className="grid grid-cols-3 gap-0.5 mt-0.5">
            {Array.from(new Map([...ME.posts, ...MOCK_POSTS].map((p) => [p.id, p])).values()).map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="aspect-square relative block overflow-hidden">
                <img src={post.image} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                {post.fish && (
                  <div className="absolute bottom-1.5 left-1.5 glass-panel px-1.5 py-0.5 rounded-full text-[9px] font-bold text-surface-tint">
                    {post.fish.weight}kg
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 pt-3 space-y-3">
            {ME.marketPosts.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <p className="text-3xl mb-2">🛒</p>
                <p className="text-sm">등록된 판매 글이 없습니다</p>
                <Link href="/post/new" className="inline-block mt-4 text-xs text-surface-tint hover:underline">
                  장터 글 작성하기
                </Link>
              </div>
            ) : (
              ME.marketPosts.map((item) => (
                <Link key={item.id} href={`/market/${item.id}`} className="flex gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant/50 hover:border-outline transition-all">
                  <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface line-clamp-1">{item.title}</p>
                    <p className="text-sm font-bold text-surface-tint mt-1">{item.price.toLocaleString()}원</p>
                    <p className="text-xs text-outline mt-0.5">{item.createdAt}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
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
            <Link href="/login" className="w-full text-left px-4 py-3 text-sm text-error hover:bg-surface-container transition-colors flex items-center gap-3">
              <LogOutIcon size={16} />로그아웃
            </Link>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
