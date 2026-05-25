"use client";

import { use, useState } from "react";
import Link from "next/link";
import { MOCK_MARKET_POSTS, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/mock-data";
import BottomNav from "@/components/BottomNav";
import { ArrowLeftIcon, MoreVerticalIcon } from "@/components/icons";

const STATUS_STYLES: Record<string, string> = {
  selling: "bg-surface-tint/20 text-surface-tint border-surface-tint/40",
  reserved: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  sold: "bg-surface-container-high text-outline border-outline-variant",
};

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const item = MOCK_MARKET_POSTS.find((p) => p.id === id) ?? MOCK_MARKET_POSTS[0];
  const [status, setStatus] = useState(item.status);
  const [showStatusSheet, setShowStatusSheet] = useState(false);

  const STATUSES = ["selling", "reserved", "sold"] as const;

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/market" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeftIcon size={22} />
          </Link>
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
          <button
            onClick={() => setShowStatusSheet(true)}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <MoreVerticalIcon size={22} />
          </button>
        </div>
      </header>

      <main className="pt-14 pb-28">
        {/* 이미지 */}
        <div className="aspect-square w-full">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>

        {/* 상품 정보 */}
        <div className="px-4 py-5 border-b border-outline-variant/30">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-on-surface flex-1">{item.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]}
            </span>
          </div>
          <p className="text-2xl font-bold text-surface-tint mt-3 font-brand">
            {item.price.toLocaleString()}<span className="text-base font-normal text-on-surface-variant ml-1">원</span>
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-outline">
            <span className="px-2 py-1 bg-surface-container rounded">{CATEGORY_LABELS[item.category]}</span>
            <span>📍 {item.location}</span>
            <span>{item.createdAt}</span>
          </div>
        </div>

        {/* 판매자 */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-outline-variant/30">
          <img src={item.user.avatar} alt={item.user.username} className="w-10 h-10 rounded-full object-cover ring-1 ring-outline-variant" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-on-surface">{item.user.username}</p>
            <p className="text-xs text-on-surface-variant">판매자</p>
          </div>
          <Link href="/profile" className="text-xs text-surface-tint font-medium hover:text-primary-fixed transition-colors">
            프로필 보기
          </Link>
        </div>

        {/* 상품 설명 */}
        <div className="px-4 py-5">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">상품 설명</h3>
          <p className="text-sm text-on-surface leading-relaxed">{item.description}</p>
        </div>
      </main>

      {/* 구매 CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-t border-outline-variant/30 px-4 py-3">
        <button
          disabled={status === "sold"}
          className="w-full h-13 rounded-lg bg-surface-tint text-on-primary font-bold text-sm glow-mint hover:bg-primary-fixed transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center h-12"
        >
          {status === "sold" ? "거래 완료" : status === "reserved" ? "예약중" : "채팅으로 거래하기"}
        </button>
      </div>

      {/* 상태 변경 바텀시트 */}
      {showStatusSheet && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowStatusSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto glass-panel rounded-t-2xl border-t border-outline-variant/50 p-5">
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />
            <h3 className="text-base font-bold text-on-surface mb-4">판매 상태 변경</h3>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setShowStatusSheet(false); }}
                className={`w-full text-left px-4 py-3.5 rounded-lg mb-2 flex items-center justify-between transition-all ${
                  status === s ? "bg-surface-tint/15 border border-surface-tint/40" : "bg-surface-container border border-transparent"
                }`}
              >
                <span className={`text-sm font-medium ${status === s ? "text-surface-tint" : "text-on-surface"}`}>
                  {STATUS_LABELS[s]}
                </span>
                {status === s && <span className="text-surface-tint text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
