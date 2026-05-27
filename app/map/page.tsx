"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { LayersIcon, XIcon } from "@/components/icons";

const AerialMap = dynamic(() => import("@/components/AerialMap"), { ssr: false });

const YEARS = [
  { key: "현재", label: "현재", sub: "최신 위성사진 (Vworld)" },
  { key: "2023", label: "2023년", sub: "2023년 12월" },
  { key: "2021", label: "2021년", sub: "2021년 12월" },
  { key: "2019", label: "2019년", sub: "2019년 12월" },
  { key: "2017", label: "2017년", sub: "2017년 11월" },
  { key: "2015", label: "2015년 🔥", sub: "극심한 가뭄 — 저수지 바닥 노출" },
];

export default function MapPage() {
  const [year, setYear] = useState("현재");
  const [panelOpen, setPanelOpen] = useState(false);

  const selectedYear = YEARS.find((y) => y.key === year) ?? YEARS[0];

  return (
    <div className="max-w-md mx-auto">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-center px-5 h-14">
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
        </div>
      </header>

      {/* 지도 영역 — 헤더(56px)와 BottomNav(64px) 사이 */}
      <div className="fixed left-0 right-0 max-w-md mx-auto" style={{ top: 56, bottom: 64 }}>

        {/* 지도 */}
        <AerialMap year={year} />

        {/* ── 지도 설정 패널 ── */}

        {/* 백드롭 */}
        <div
          className={`absolute inset-0 z-[900] bg-black/50 transition-opacity duration-300 ${
            panelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setPanelOpen(false)}
        />

        {/* 슬라이드 패널 */}
        <div
          className={`absolute left-0 top-0 bottom-0 z-[910] w-[72%] flex flex-col
            bg-surface-container border-r border-outline-variant/30
            transition-transform duration-300 ease-out
            ${panelOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* 패널 헤더 */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-outline-variant/30 flex-shrink-0">
            <h2 className="text-sm font-bold text-on-surface tracking-wide">지도 설정</h2>
            <button
              onClick={() => setPanelOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <XIcon size={18} />
            </button>
          </div>

          {/* 항공사진 연도 섹션 */}
          <div className="px-4 pt-5 pb-3 flex-shrink-0">
            <p className="text-[10px] font-bold text-surface-tint uppercase tracking-widest mb-3">
              항공사진 연도
            </p>
            <div className="space-y-1.5">
              {YEARS.map((y) => {
                const active = year === y.key;
                return (
                  <button
                    key={y.key}
                    onClick={() => { setYear(y.key); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between gap-2 ${
                      active
                        ? "bg-surface-tint text-on-primary shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/40"
                    }`}
                  >
                    <span>{y.label}</span>
                    {active && (
                      <span className="text-[10px] font-bold opacity-60 flex-shrink-0">✓ 선택</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 선택 연도 설명 */}
          <div className="px-4 pb-4">
            <div className="rounded-xl bg-surface-container-high border border-outline-variant/30 px-4 py-3">
              <p className="text-[11px] font-bold text-surface-tint mb-1">
                {selectedYear.label}
              </p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {selectedYear.sub}
              </p>
              {year === "2015" && (
                <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed border-t border-outline-variant/30 pt-1.5">
                  물이 빠진 저수지 바닥 지형으로 숨겨진 포인트를 찾아보세요
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 플로팅 UI ── */}

        {/* 오른쪽: 레이어 버튼 */}
        <div className="absolute right-3 top-3 z-[800]">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
              panelOpen
                ? "bg-surface-tint text-on-primary"
                : "glass-panel text-on-surface-variant hover:text-on-surface border border-outline-variant/40"
            }`}
          >
            <LayersIcon size={20} />
          </button>
        </div>

        {/* 왼쪽: 현재 선택 연도 뱃지 (패널 닫혔을 때만) */}
        <div
          className={`absolute top-3 left-3 z-[800] transition-opacity duration-200 ${
            panelOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <button
            onClick={() => setPanelOpen(true)}
            className="glass-panel rounded-full px-4 py-2 flex items-center gap-2 border border-outline-variant/30 hover:border-surface-tint/50 transition-colors"
          >
            <LayersIcon size={12} className="text-surface-tint" />
            <span className="text-xs font-bold text-on-surface">
              {selectedYear.label}
            </span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
