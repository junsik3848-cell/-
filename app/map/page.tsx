"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { LayersIcon, XIcon } from "@/components/icons";
import SpotInfoSheet from "@/components/SpotInfoSheet";
import type { SpotRow } from "@/components/NaverMap";
import { useAuth } from "@/context/AuthContext";

const NaverMap = dynamic(() => import("@/components/NaverMap"), { ssr: false });
const AerialMap = dynamic(() => import("@/components/AerialMap"), { ssr: false });

type MapMode = "naver" | "wayback";

const YEARS = [
  { key: "2023", label: "2023년", sub: "2023년 12월" },
  { key: "2021", label: "2021년", sub: "2021년 12월" },
  { key: "2019", label: "2019년", sub: "2019년 12월" },
  { key: "2017", label: "2017년", sub: "2017년 11월" },
  { key: "2015", label: "2015년 🔥", sub: "극심한 가뭄 — 저수지 바닥 노출" },
];

const ADMIN_EMAIL = "junsik3848@gmail.com";

export default function MapPage() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [mapMode, setMapMode] = useState<MapMode>("naver");
  const [year, setYear] = useState("2021");
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<SpotRow | null>(null);
  const [editMode, setEditMode] = useState(false);

  const selectedYear = YEARS.find((y) => y.key === year) ?? YEARS[0];

  return (
    <div className="max-w-md mx-auto">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-center px-5 h-14">
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
        </div>
      </header>

      {/* 지도 영역 */}
      <div className="fixed left-0 right-0 max-w-md mx-auto" style={{ top: 56, bottom: 64 }}>

        {/* 지도 — 두 컴포넌트 모두 마운트 유지 (상태 보존), visibility로 전환 */}
        <div className={mapMode === "naver" ? "absolute inset-0" : "hidden"}>
          <NaverMap
            onSpotClick={editMode ? undefined : setSelectedSpot}
            editMode={editMode}
            onSpotsChanged={() => {}}
          />
        </div>
        <div className={mapMode === "wayback" ? "absolute inset-0" : "hidden"}>
          <AerialMap year={year} visible={mapMode === "wayback"} />
        </div>

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

          {/* 지도 유형 선택 */}
          <div className="px-4 pt-5 flex-shrink-0">
            <p className="text-[10px] font-bold text-surface-tint uppercase tracking-widest mb-3">
              지도 유형
            </p>
            <div className="space-y-2">
              {/* 네이버지도 */}
              <button
                onClick={() => setMapMode("naver")}
                className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                  mapMode === "naver"
                    ? "bg-surface-tint text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant border border-outline-variant/40 hover:text-on-surface"
                }`}
              >
                <span className="text-xl">🗺️</span>
                <div>
                  <p className="font-bold text-sm leading-none">네이버지도</p>
                  <p className={`text-[11px] mt-1 ${mapMode === "naver" ? "text-on-primary/70" : "text-outline"}`}>
                    일반 · 위성 · 하이브리드
                  </p>
                </div>
                {mapMode === "naver" && (
                  <span className="ml-auto text-xs font-bold opacity-60">✓</span>
                )}
              </button>

              {/* ESRI Wayback */}
              <button
                onClick={() => setMapMode("wayback")}
                className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                  mapMode === "wayback"
                    ? "bg-surface-tint text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant border border-outline-variant/40 hover:text-on-surface"
                }`}
              >
                <span className="text-xl">🛰️</span>
                <div>
                  <p className="font-bold text-sm leading-none">ESRI Wayback</p>
                  <p className={`text-[11px] mt-1 ${mapMode === "wayback" ? "text-on-primary/70" : "text-outline"}`}>
                    연도별 위성사진 비교
                  </p>
                </div>
                {mapMode === "wayback" && (
                  <span className="ml-auto text-xs font-bold opacity-60">✓</span>
                )}
              </button>
            </div>
          </div>

          {/* 연도 선택 — Wayback 선택 시만 표시 */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              mapMode === "wayback" ? "opacity-100 max-h-96 mt-4" : "opacity-0 max-h-0"
            }`}
          >
            <div className="px-4 pt-1 pb-4 border-t border-outline-variant/20">
              <p className="text-[10px] font-bold text-surface-tint uppercase tracking-widest mb-3 pt-4">
                연도 선택
              </p>
              <div className="space-y-1.5">
                {YEARS.map((y) => (
                  <button
                    key={y.key}
                    onClick={() => setYear(y.key)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between ${
                      year === y.key
                        ? "bg-surface-container-highest border border-surface-tint/60 text-on-surface font-bold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span>{y.label}</span>
                    {year === y.key && <span className="text-surface-tint text-xs">✓</span>}
                  </button>
                ))}
              </div>

              {/* 선택 연도 설명 */}
              <div className="mt-3 rounded-xl bg-surface-container-high border border-outline-variant/30 px-3 py-2.5">
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {selectedYear.sub}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 레이어 버튼 (우측 상단) */}
        <div className="absolute right-3 top-16 z-[800] flex flex-col gap-2">
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

          {/* 관리자 편집 모드 버튼 */}
          {isAdmin && mapMode === "naver" && (
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-xs font-bold transition-all ${
                editMode
                  ? "bg-red-500 text-white"
                  : "glass-panel text-on-surface-variant border border-outline-variant/40"
              }`}
              title={editMode ? "편집 종료" : "핀 편집"}
            >
              {editMode ? "완료" : "✏️"}
            </button>
          )}
        </div>

      </div>

      <SpotInfoSheet spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
      <BottomNav />
    </div>
  );
}
