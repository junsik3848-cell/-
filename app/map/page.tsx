"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import BottomNav from "@/components/BottomNav";
import { LayersIcon, XIcon, SearchIcon, StarIcon, MapPinIcon } from "@/components/icons";
import SpotInfoSheet from "@/components/SpotInfoSheet";
import type { SpotRow, FavoriteRow } from "@/components/NaverMap";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

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
  const [mapType, setMapType] = useState<"normal" | "satellite" | "hybrid">("normal");
  const [year, setYear] = useState("2021");
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<SpotRow | null>(null);
  const [editMode, setEditMode] = useState(false);

  // 검색
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotRow[]>([]);

  // 즐겨찾기
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [centerTo, setCenterTo] = useState<{ lat: number; lng: number } | null>(null);

  const selectedYear = YEARS.find((y) => y.key === year) ?? YEARS[0];

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("favorites")
      .select("id, spot_id, name, lat, lng")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFavorites((data as FavoriteRow[]) ?? []);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from("fishing_spots")
      .select("id, name, lat, lng")
      .ilike("name", `%${q}%`)
      .limit(10);
    setSearchResults((data as SpotRow[]) ?? []);
  }

  function handleSearchSelect(spot: SpotRow) {
    setCenterTo({ lat: spot.lat, lng: spot.lng });
    setSelectedSpot(spot);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }

  async function handleLongPress(lat: number, lng: number) {
    if (!user) return;
    const name = prompt("즐겨찾기 이름을 입력하세요:");
    if (!name?.trim()) return;
    const supabase = createClient();
    await supabase.from("favorites").insert({
      user_id: user.id,
      name: name.trim(),
      lat,
      lng,
    });
    fetchFavorites();
  }

  async function handleToggleFavorite() {
    if (!user || !selectedSpot) return;
    const supabase = createClient();
    const existing = favorites.find((f) => f.spot_id === selectedSpot.id);
    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        spot_id: selectedSpot.id,
        name: selectedSpot.name,
        lat: selectedSpot.lat,
        lng: selectedSpot.lng,
      });
    }
    fetchFavorites();
  }

  async function deleteFavorite(id: string) {
    const supabase = createClient();
    await supabase.from("favorites").delete().eq("id", id);
    fetchFavorites();
  }

  return (
    <div className="max-w-md mx-auto">
      {/* 지도 영역 */}
      <div className="fixed left-0 right-0 max-w-md mx-auto" style={{ top: 0, bottom: 64 }}>

        {/* 지도 — 두 컴포넌트 모두 마운트 유지 (상태 보존), visibility로 전환 */}
        <div className={mapMode === "naver" ? "absolute inset-0" : "hidden"}>
          <NaverMap
            onSpotClick={editMode ? undefined : setSelectedSpot}
            editMode={editMode}
            onSpotsChanged={() => {}}
            mapType={mapType}
            favorites={favorites}
            centerTo={centerTo}
            onLongPress={user ? handleLongPress : undefined}
          />
        </div>
        <div className={mapMode === "wayback" ? "absolute inset-0" : "hidden"}>
          <AerialMap year={year} visible={mapMode === "wayback"} />
        </div>

        {/* 검색 오버레이 */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-0 z-[920]">
            <div className="bg-surface-container-high border-b border-outline-variant/30 px-3 py-2.5 flex items-center gap-2">
              <SearchIcon size={16} className="text-on-surface-variant flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="저수지 이름 검색..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-on-surface placeholder-on-surface-variant/50 outline-none"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant"
              >
                <XIcon size={16} />
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="bg-surface-container-high border-t border-outline-variant/20 max-h-60 overflow-y-auto">
                {searchResults.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => handleSearchSelect(spot)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high transition-colors border-b border-outline-variant/10 last:border-0"
                  >
                    <MapPinIcon size={14} className="text-surface-tint flex-shrink-0" />
                    <span className="text-sm text-on-surface">{spot.name}</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="bg-surface-container-high px-4 py-3">
                <p className="text-xs text-on-surface-variant">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* 즐겨찾기 바텀시트 백드롭 */}
        <div
          className={`absolute inset-0 z-[830] bg-black/50 transition-opacity duration-300 ${
            favoritesOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setFavoritesOpen(false)}
        />

        {/* 즐겨찾기 바텀시트 */}
        <div
          className={`absolute left-0 right-0 z-[835] bg-surface-container border-t border-outline-variant/30 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out`}
          style={{
            bottom: 0,
            maxHeight: "55vh",
            transform: favoritesOpen ? "translateY(0)" : "translateY(110%)",
          }}
        >
          <div className="flex items-center justify-between px-5 h-12 border-b border-outline-variant/30">
            <h2 className="text-sm font-bold text-on-surface">즐겨찾기</h2>
            <button
              onClick={() => setFavoritesOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant"
            >
              <XIcon size={16} />
            </button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(55vh - 48px)" }}>
            {favorites.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-on-surface-variant">즐겨찾기가 없습니다</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">저수지 핀을 탭하거나 지도를 길게 눌러 추가하세요</p>
              </div>
            ) : (
              favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-outline-variant/10 last:border-0"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: "#ffd43b", boxShadow: "0 0 6px rgba(255,212,59,0.6)" }}
                  />
                  <button
                    className="flex-1 text-left text-sm text-on-surface"
                    onClick={() => {
                      setCenterTo({ lat: fav.lat, lng: fav.lng });
                      setFavoritesOpen(false);
                    }}
                  >
                    {fav.name}
                  </button>
                  <button
                    onClick={() => deleteFavorite(fav.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface flex-shrink-0"
                  >
                    <XIcon size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 설정 패널 백드롭 */}
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
              {/* 출조 지도 */}
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
                  <p className="font-bold text-sm leading-none">출조 지도</p>
                  <p className={`text-[11px] mt-1 ${mapMode === "naver" ? "text-on-primary/70" : "text-outline"}`}>
                    일반 · 위성 · 하이브리드
                  </p>
                </div>
                {mapMode === "naver" && (
                  <span className="ml-auto text-xs font-bold opacity-60">✓</span>
                )}
              </button>

              {/* 네이버지도 타입 선택 */}
              {mapMode === "naver" && (
                <div className="flex gap-2 mt-2">
                  {(["normal", "satellite", "hybrid"] as const).map((type) => {
                    const labels = { normal: "일반", satellite: "위성", hybrid: "하이브리드" };
                    const active = mapType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setMapType(type)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          active
                            ? "bg-surface-tint text-on-primary"
                            : "bg-surface-container-high text-on-surface-variant border border-outline-variant/40"
                        }`}
                      >
                        {labels[type]}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 연도별 위성사진 */}
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
                  <p className="font-bold text-sm leading-none">연도별 위성사진</p>
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

        {/* 우측 버튼 스택 */}
        <div className={`absolute right-3 z-[800] flex flex-col gap-2 transition-all duration-200 ${searchOpen ? "top-14" : "top-3"}`}>
          {/* 검색 버튼 */}
          <button
            onClick={() => { setSearchOpen(true); setPanelOpen(false); setFavoritesOpen(false); }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
              searchOpen
                ? "bg-surface-tint text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/40"
            }`}
          >
            <SearchIcon size={19} />
          </button>

          {/* 레이어 버튼 */}
          <button
            onClick={() => { setPanelOpen((v) => !v); setFavoritesOpen(false); }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
              panelOpen
                ? "bg-surface-tint text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/40"
            }`}
          >
            <LayersIcon size={20} />
          </button>

          {/* 즐겨찾기 버튼 */}
          {user && (
            <button
              onClick={() => { setFavoritesOpen((v) => !v); setPanelOpen(false); }}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
                favoritesOpen
                  ? "bg-surface-tint text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/40"
              }`}
            >
              <StarIcon
                size={19}
                fill={favorites.length > 0 ? "#ffd43b" : "none"}
                stroke={favorites.length > 0 ? "#ffd43b" : "currentColor"}
              />
            </button>
          )}

          {/* 관리자 편집 모드 버튼 */}
          {isAdmin && mapMode === "naver" && (
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-xs font-bold transition-all ${
                editMode
                  ? "bg-red-500 text-white"
                  : "bg-surface-container-high text-on-surface-variant border border-outline-variant/40"
              }`}
              title={editMode ? "편집 종료" : "핀 편집"}
            >
              {editMode ? "완료" : "✏️"}
            </button>
          )}
        </div>

      </div>

      <SpotInfoSheet
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        isFavorited={!!favorites.find((f) => f.spot_id === selectedSpot?.id)}
        onToggleFavorite={user ? handleToggleFavorite : undefined}
      />
      <BottomNav />
    </div>
  );
}
