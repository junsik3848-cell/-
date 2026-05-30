"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { SearchIcon } from "@/components/icons";
import { MOCK_MARKET_POSTS } from "@/lib/mock-data";

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "rod", label: "로드" },
  { key: "reel", label: "릴" },
  { key: "lure", label: "루어" },
  { key: "etc", label: "기타" },
];


export default function MarketPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_MARKET_POSTS.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = search === "" || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-center px-5 h-14 relative">
          <h1
            className="font-brand text-xl font-bold tracking-widest text-surface-tint cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >LUNKER</h1>
        </div>
      </header>

      <main className="pt-14 pb-20">
        {/* 검색 + 필터 */}
        <div className="px-4 pt-4 pb-2 space-y-3">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="장비 검색..."
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  category === c.key
                    ? "bg-surface-tint text-on-primary"
                    : "bg-surface-container border border-outline-variant text-on-surface-variant"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 상품 리스트 */}
        <div className="mt-2">
          <p className="text-xs text-on-surface-variant px-4 mb-1">{filtered.length}개의 상품</p>
          <div className="divide-y divide-outline-variant/30">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/market/${item.id}`}
                className="flex items-start gap-4 px-4 py-5 active:bg-surface-container transition-colors"
              >
                {/* 왼쪽 썸네일 */}
                <div className="relative flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-[110px] h-[110px] rounded-xl object-cover"
                  />
                  {item.status === "sold" && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">거래완료</span>
                    </div>
                  )}
                </div>

                {/* 오른쪽 내용 */}
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-semibold leading-snug line-clamp-2 ${item.status === "sold" ? "text-outline" : "text-on-surface"}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <span className="text-sm text-outline">{item.location}</span>
                    <span className="text-sm text-outline">·</span>
                    <span className="text-sm text-outline">{item.createdAt}</span>
                    {item.status === "reserved" && (
                      <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">예약중</span>
                    )}
                  </div>
                  <p className={`text-lg font-bold mt-2 ${item.status === "sold" ? "text-outline line-through" : "text-on-surface"}`}>
                    {item.price.toLocaleString()}원
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              <p className="text-4xl mb-3">🎣</p>
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
