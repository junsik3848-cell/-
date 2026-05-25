"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { SearchIcon, MapIcon } from "@/components/icons";
import { MOCK_MARKERS, type Marker } from "@/lib/mock-data";

const STRUCTURE_TYPES = [
  { key: "all", label: "전체" },
  { key: "rock", label: "암반" },
  { key: "weed", label: "수초" },
  { key: "bridge", label: "교각" },
  { key: "dock", label: "선착장" },
  { key: "inlet", label: "유입구" },
];

const TYPE_COLORS: Record<string, string> = {
  rock: "#83958c",
  weed: "#00e1ab",
  bridge: "#6699ff",
  dock: "#ffaa44",
  inlet: "#ff88cc",
};

const TYPE_ICONS: Record<string, string> = {
  rock: "🪨",
  weed: "🌿",
  bridge: "🌉",
  dock: "⚓",
  inlet: "🌊",
};

export default function MapPage() {
  const [filter, setFilter] = useState("all");
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);

  const filtered = filter === "all" ? MOCK_MARKERS : MOCK_MARKERS.filter((m) => m.type === filter);

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-center px-5 h-14 relative">
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
        </div>
      </header>

      <main className="flex-1 pt-14 pb-20 flex flex-col">
        {/* 지도 영역 */}
        <div className="relative flex-1" style={{ minHeight: "55vw", maxHeight: "55vw" }}>
          {/* 지도 플레이스홀더 */}
          <div className="absolute inset-0 bg-surface-container-low overflow-hidden">
            <img
              src="https://picsum.photos/seed/map/800/500"
              alt="필드 지도"
              className="w-full h-full object-cover opacity-30"
            />
            {/* 그리드 */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3a4a43" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* 마커들 */}
            {filtered.map((marker, i) => (
              <button
                key={marker.id}
                onClick={() => setSelectedMarker(marker === selectedMarker ? null : marker)}
                style={{
                  left: `${20 + (i * 15) % 70}%`,
                  top: `${15 + (i * 25) % 65}%`,
                  color: TYPE_COLORS[marker.type],
                }}
                className="absolute transform -translate-x-1/2 -translate-y-full"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-lg border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: `${TYPE_COLORS[marker.type]}22`,
                      borderColor: TYPE_COLORS[marker.type],
                    }}
                  >
                    {TYPE_ICONS[marker.type]}
                  </div>
                  <div
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: `${TYPE_COLORS[marker.type]}33`, color: TYPE_COLORS[marker.type] }}
                  >
                    {marker.title.slice(0, 6)}
                  </div>
                </div>
              </button>
            ))}

            {/* 지도 안내 오버레이 */}
            <div className="absolute top-3 right-3 glass-panel rounded-lg px-3 py-2 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <MapIcon size={12} />
                카카오맵 연동 예정
              </div>
            </div>
          </div>
        </div>

        {/* 검색창 */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="포인트 검색..."
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
            />
          </div>
        </div>

        {/* 구조물 필터 */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {STRUCTURE_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                filter === t.key
                  ? "bg-surface-tint text-on-primary"
                  : "bg-surface-container border border-outline-variant text-on-surface-variant"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 마커 목록 */}
        <div className="px-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              포인트 {filtered.length}개
            </p>
            <button className="text-xs text-surface-tint font-medium flex items-center gap-1 hover:text-primary-fixed transition-colors">
              + 마커 등록
            </button>
          </div>

          {filtered.map((marker) => (
            <button
              key={marker.id}
              onClick={() => setSelectedMarker(marker === selectedMarker ? null : marker)}
              className={`w-full text-left rounded-lg p-3 border transition-all ${
                selectedMarker?.id === marker.id
                  ? "bg-surface-container border-surface-tint/50"
                  : "bg-surface-container border-outline-variant/50 hover:border-outline"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${TYPE_COLORS[marker.type]}22` }}
                >
                  {TYPE_ICONS[marker.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-on-surface truncate">{marker.title}</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `${TYPE_COLORS[marker.type]}22`, color: TYPE_COLORS[marker.type] }}
                    >
                      {STRUCTURE_TYPES.find((t) => t.key === marker.type)?.label}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{marker.description}</p>
                  <p className="text-[10px] text-outline mt-1">조황 보고 {marker.reports}건</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
