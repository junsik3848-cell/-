"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

const AerialMap = dynamic(() => import("@/components/AerialMap"), { ssr: false });

const YEARS = [
  { key: "현재", label: "현재" },
  { key: "2021", label: "2021" },
  { key: "2018", label: "2018" },
  { key: "2015", label: "2015" },
  { key: "2012", label: "2012" },
  { key: "2009", label: "2009" },
];

const YEAR_HINTS: Record<string, string> = {
  "현재": "최신 위성사진",
  "2021": "2021년 항공사진",
  "2018": "2018년 항공사진",
  "2015": "2015년 가뭄기 — 저수지 바닥 노출",
  "2012": "2012년 항공사진",
  "2009": "2009년 항공사진",
};

export default function MapPage() {
  const [year, setYear] = useState("현재");

  return (
    <div className="max-w-md mx-auto">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-center px-5 h-14">
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
        </div>
      </header>

      {/* 지도 영역 — 헤더(56px)와 BottomNav(64px) 사이를 꽉 채움 */}
      <div
        className="fixed left-0 right-0 max-w-md mx-auto"
        style={{ top: 56, bottom: 64 }}
      >
        <AerialMap year={year} />

        {/* 연도 탭 — 지도 위 글래스 오버레이 */}
        <div className="absolute top-3 left-3 right-3 z-[1000]">
          <div className="glass-panel rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-semibold text-surface-tint mb-2 tracking-wider uppercase">
              항공사진 연도 선택
            </p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {YEARS.map((y) => (
                <button
                  key={y.key}
                  onClick={() => setYear(y.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                    year === y.key
                      ? "bg-surface-tint text-on-primary shadow-sm"
                      : "bg-surface-container-high/80 text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 현재 선택 연도 힌트 + 사용법 안내 */}
        <div className="absolute bottom-4 left-3 z-[1000] space-y-2">
          <div className="glass-panel rounded-lg px-3 py-2.5 max-w-[220px]">
            <p className="text-[11px] font-bold text-surface-tint">{YEAR_HINTS[year]}</p>
            <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">
              가뭄 연도 선택 시 물이 빠져<br />물속 지형을 파악할 수 있어요
            </p>
          </div>
        </div>

        {/* Vworld 키 미설정 안내 */}
        {!process.env.NEXT_PUBLIC_VWORLD_KEY && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <div className="glass-panel rounded-xl px-5 py-4 text-center max-w-[260px]">
              <p className="text-2xl mb-2">🗺️</p>
              <p className="text-sm font-bold text-on-surface mb-1">Vworld API 키 필요</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                api.vworld.kr 에서 무료 발급 후<br />
                <span className="text-surface-tint font-mono">.env.local</span>에 입력하세요
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
