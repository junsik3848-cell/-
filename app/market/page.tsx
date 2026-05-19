"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { SearchIcon } from "@/components/icons";
import { MOCK_MARKET_POSTS, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/mock-data";

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "rod", label: "로드" },
  { key: "reel", label: "릴" },
  { key: "lure", label: "루어" },
  { key: "etc", label: "기타" },
];

const STATUS_STYLES: Record<string, string> = {
  selling: "bg-surface-tint/20 text-surface-tint",
  reserved: "bg-yellow-500/20 text-yellow-400",
  sold: "bg-surface-container-high text-outline line-through",
};

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
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-b border-outline-variant/30">
        <div className="flex items-center justify-center px-5 h-14 relative">
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
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

        {/* 상품 그리드 */}
        <div className="px-4 mt-2">
          <p className="text-xs text-on-surface-variant mb-3">{filtered.length}개의 상품</p>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/market/${item.id}`}
                className="block bg-surface-container rounded-lg overflow-hidden border border-outline-variant/50 hover:border-outline transition-all active:scale-95"
              >
                <div className="relative aspect-square">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-on-surface line-clamp-2 leading-snug">{item.title}</p>
                  <p className="text-sm font-bold text-surface-tint mt-1.5">
                    {item.price.toLocaleString()}원
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-outline">{item.location}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
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
