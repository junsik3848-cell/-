"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@/components/icons";
import { createBrowserClient } from "@supabase/ssr";
import type { SpotRow } from "@/components/NaverMap";

interface CatchPost {
  id: string;
  images: string[];
  caption: string;
  weight: number | null;
  length: number | null;
  created_at: string;
  users: { username: string; avatar_url: string | null };
}

interface Weather {
  temp: string;
  emoji: string;
  desc: string;
}

function weatherEmoji(code: string): string {
  const c = parseInt(code);
  if (c === 113) return "☀️";
  if (c === 116) return "⛅";
  if (c >= 119 && c <= 122) return "☁️";
  if ([143, 248, 260].includes(c)) return "🌫️";
  if (c >= 200 && c < 300) return "⛈️";
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308].includes(c)) return "🌧️";
  if ([179, 182, 185, 227, 230, 317, 320, 323, 326].includes(c)) return "❄️";
  return "🌤️";
}

function mockWaterLevel(name: string): number {
  let h = 0;
  for (const c of name) h = ((h * 31) + c.charCodeAt(0)) & 0xffff;
  return 40 + (h % 50);
}

function waterLevelColor(pct: number): string {
  if (pct < 50) return "#ff6b6b";
  if (pct < 70) return "#ffd43b";
  return "#00e1ab";
}

interface Props {
  spot: SpotRow | null;
  onClose: () => void;
}

export default function SpotInfoSheet({ spot, onClose }: Props) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [catches, setCatches] = useState<CatchPost[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingCatches, setLoadingCatches] = useState(false);

  useEffect(() => {
    if (!spot) {
      setWeather(null);
      setCatches([]);
      return;
    }

    setLoadingWeather(true);
    fetch(`https://wttr.in/${spot.lat},${spot.lng}?format=j1`)
      .then((r) => r.json())
      .then((d) => {
        const c = d.current_condition[0];
        setWeather({
          temp: c.temp_C,
          emoji: weatherEmoji(c.weatherCode),
          desc: c.weatherDesc[0].value,
        });
      })
      .catch(() => setWeather(null))
      .finally(() => setLoadingWeather(false));

    setLoadingCatches(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("posts")
      .select("id, images, caption, weight, length, created_at, users(username, avatar_url)")
      .ilike("location", `%${spot.name}%`)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setCatches((data as any) ?? []);
        setLoadingCatches(false);
      });
  }, [spot]);

  const waterLevel = spot ? mockWaterLevel(spot.name) : 0;
  const wlColor = waterLevelColor(waterLevel);

  return (
    <>
      {/* 백드롭 */}
      <div
        className={`fixed inset-0 z-[840] transition-opacity duration-300 ${
          spot ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 시트 */}
      <div
        className={`fixed left-0 right-0 max-w-md mx-auto z-[850] transition-transform duration-300 ease-out
          bg-surface-container border-t border-outline-variant/30 rounded-t-2xl shadow-2xl`}
        style={{
          bottom: 64,
          maxHeight: "60vh",
          overflowY: "auto",
          transform: spot ? "translateY(0)" : "translateY(110%)",
        }}
      >
        {spot && (
          <div className="px-5 pt-5 pb-6">
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-on-surface">{spot.name}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">저수지</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors flex-shrink-0"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* 날씨 + 수위 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* 날씨 */}
              <div className="bg-surface-container-high rounded-xl px-4 py-3">
                <p className="text-[10px] text-surface-tint font-bold uppercase tracking-widest mb-2">날씨</p>
                {loadingWeather ? (
                  <p className="text-xs text-on-surface-variant">로딩 중…</p>
                ) : weather ? (
                  <div>
                    <p className="text-2xl leading-none">{weather.emoji}</p>
                    <p className="text-lg font-bold text-on-surface mt-1">{weather.temp}°C</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{weather.desc}</p>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant">날씨 정보 없음</p>
                )}
              </div>

              {/* 수위 */}
              <div className="bg-surface-container-high rounded-xl px-4 py-3">
                <p className="text-[10px] text-surface-tint font-bold uppercase tracking-widest mb-2">수위</p>
                <p className="text-lg font-bold text-on-surface">{waterLevel}%</p>
                <div className="mt-2 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${waterLevel}%`, background: wlColor }}
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1.5">
                  {waterLevel < 50 ? "저수위" : waterLevel < 70 ? "보통" : "만수위"}
                </p>
              </div>
            </div>

            {/* 조황 기록 */}
            <div>
              <p className="text-[10px] font-bold text-surface-tint uppercase tracking-widest mb-3">조황 기록</p>
              {loadingCatches ? (
                <p className="text-xs text-on-surface-variant">로딩 중…</p>
              ) : catches.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-on-surface-variant">아직 조황 기록이 없어요</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">첫 번째 기록을 남겨보세요!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {catches.map((post) => (
                    <div key={post.id} className="flex items-center gap-3">
                      {post.images?.[0] && (
                        <img
                          src={post.images[0]}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface">{post.users?.username}</p>
                        {(post.weight || post.length) && (
                          <p className="text-xs text-surface-tint">
                            {post.weight ? `${post.weight}g` : ""}{post.weight && post.length ? " · " : ""}{post.length ? `${post.length}cm` : ""}
                          </p>
                        )}
                        <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{post.caption}</p>
                      </div>
                      <p className="text-[10px] text-on-surface-variant flex-shrink-0">
                        {new Date(post.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
