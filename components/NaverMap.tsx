"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? "";

declare global {
  interface Window { naver: any; }
}

export interface SpotRow {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface FavoriteRow {
  id: string;
  spot_id: string | null;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  onSpotClick?: (spot: SpotRow) => void;
  editMode?: boolean;
  onSpotsChanged?: () => void;
  mapType?: "normal" | "satellite" | "hybrid";
  favorites?: FavoriteRow[];
  centerTo?: { lat: number; lng: number } | null;
  onLongPress?: (lat: number, lng: number) => void;
  onMapClick?: () => void;
}

export default function NaverMap({
  onSpotClick,
  editMode = false,
  onSpotsChanged,
  mapType = "normal",
  favorites = [],
  centerTo,
  onLongPress,
  onMapClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const didInit = useRef(false);
  const markersRef = useRef<Map<string, any>>(new Map());
  const favMarkersRef = useRef<Map<string, any>>(new Map());
  const favSpotIdsRef = useRef<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editModeRef = useRef(editMode);
  const onSpotClickRef = useRef(onSpotClick);
  const onSpotsChangedRef = useRef(onSpotsChanged);
  const onLongPressRef = useRef(onLongPress);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => { editModeRef.current = editMode; }, [editMode]);
  useEffect(() => { onSpotClickRef.current = onSpotClick; }, [onSpotClick]);
  useEffect(() => { onSpotsChangedRef.current = onSpotsChanged; }, [onSpotsChanged]);
  useEffect(() => { onLongPressRef.current = onLongPress; }, [onLongPress]);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  // 지도 타입 변경
  useEffect(() => {
    if (!mapRef.current || !window.naver) return;
    const { naver } = window;
    const typeMap = {
      normal: naver.maps.MapTypeId.NORMAL,
      satellite: naver.maps.MapTypeId.SATELLITE,
      hybrid: naver.maps.MapTypeId.HYBRID,
    };
    mapRef.current.setMapTypeId(typeMap[mapType]);
  }, [mapType]);

  // 지도 이동 명령
  useEffect(() => {
    if (!centerTo || !mapRef.current || !window.naver) return;
    const { naver } = window;
    mapRef.current.setCenter(new naver.maps.LatLng(centerTo.lat, centerTo.lng));
    mapRef.current.setZoom(14);
  }, [centerTo]);

  // 편집 모드 바뀌면 마커 재생성
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();
    loadMarkers();
  }, [editMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // 즐겨찾기 핀 렌더링
  useEffect(() => {
    if (!mapRef.current || !window.naver) return;
    const { naver } = window;

    // 즐겨찾기 spot_id 세트 갱신
    favSpotIdsRef.current = new Set(favorites.filter((f) => f.spot_id).map((f) => f.spot_id!));

    // 즐겨찾기된 spot의 초록 핀이 이미 있으면 제거 (노란 핀으로 대체)
    favorites.forEach((fav) => {
      if (fav.spot_id && markersRef.current.has(fav.spot_id)) {
        markersRef.current.get(fav.spot_id)?.setMap(null);
        markersRef.current.delete(fav.spot_id);
      }
    });

    favMarkersRef.current.forEach((m) => m.setMap(null));
    favMarkersRef.current.clear();

    favorites.forEach((fav) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(fav.lat, fav.lng),
        map: mapRef.current,
        icon: {
          content: `<div style="
            background:#ffd43b;border-radius:50%;
            width:15px;height:15px;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 1px 5px rgba(255,212,59,0.9);
            cursor:pointer;
          ">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>`,
          anchor: new naver.maps.Point(7, 7),
        },
      });
      naver.maps.Event.addListener(marker, "click", () => {
        onSpotClickRef.current?.({ id: fav.id, name: fav.name, lat: fav.lat, lng: fav.lng });
      });
      favMarkersRef.current.set(fav.id, marker);
    });
  }, [favorites]); // eslint-disable-line react-hooks/exhaustive-deps

  function markerContent(editable: boolean) {
    if (editable) {
      return `<div style="
        background:#ff6b6b;border-radius:50%;
        width:14px;height:14px;
        border:2px solid #fff;
        box-shadow:0 1px 6px rgba(255,107,107,0.8);
        cursor:grab;
      "></div>`;
    }
    return `<div style="
      background:#00e1ab;border-radius:50%;
      width:10px;height:10px;
      border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,225,171,0.7);
      cursor:pointer;
    "></div>`;
  }

  async function loadMarkers() {
    const map = mapRef.current;
    const naver = window.naver;
    if (!map) return;

    const zoom = map.getZoom();
    if (zoom < 11) {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();
      return;
    }

    const bounds = map.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: spots } = await supabase
      .from("fishing_spots")
      .select("id, name, lat, lng")
      .gte("lat", sw.lat()).lte("lat", ne.lat())
      .gte("lng", sw.lng()).lte("lng", ne.lng())
      .limit(300);

    if (!spots) return;

    const inBoundsIds = new Set(spots.map((s) => s.id));

    markersRef.current.forEach((marker, id) => {
      if (!inBoundsIds.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });

    spots.forEach((spot) => {
      if (markersRef.current.has(spot.id)) return;
      if (favSpotIdsRef.current.has(spot.id)) return; // 즐겨찾기 → 노란 핀이 담당

      const editable = editModeRef.current;
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(spot.lat, spot.lng),
        map,
        draggable: editable,
        icon: {
          content: markerContent(editable),
          anchor: new naver.maps.Point(editable ? 7 : 5, editable ? 7 : 5),
        },
      });

      if (editable) {
        naver.maps.Event.addListener(marker, "dragend", async () => {
          const pos = marker.getPosition();
          await supabase
            .from("fishing_spots")
            .update({ lat: pos.lat(), lng: pos.lng(), updated_at: new Date().toISOString() })
            .eq("id", spot.id);
        });

        naver.maps.Event.addListener(marker, "click", async () => {
          if (!confirm(`"${spot.name}" 핀을 삭제할까요?`)) return;
          await supabase.from("fishing_spots").delete().eq("id", spot.id);
          marker.setMap(null);
          markersRef.current.delete(spot.id);
          onSpotsChangedRef.current?.();
        });
      } else {
        naver.maps.Event.addListener(marker, "click", () => {
          onSpotClickRef.current?.(spot);
        });
      }

      markersRef.current.set(spot.id, marker);
    });
  }

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    function initMap() {
      if (!containerRef.current || mapRef.current) return;
      const { naver } = window;
      mapRef.current = new naver.maps.Map(containerRef.current, {
        center: new naver.maps.LatLng(36.5, 127.5),
        zoom: 8,
        mapTypeId: naver.maps.MapTypeId.NORMAL,
        mapTypeControl: false,
        logoControl: false,
        zoomControl: false,
      });

      // 지도 이동/줌 완료 후 마커 갱신 (디바운스 500ms)
      naver.maps.Event.addListener(mapRef.current, "idle", () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(loadMarkers, 500);
      });

      // 편집 모드 — 빈 곳 클릭 시 핀 추가 / 일반 모드 — 맵 클릭 콜백
      naver.maps.Event.addListener(mapRef.current, "click", async (e: any) => {
        if (!editModeRef.current) {
          onMapClickRef.current?.();
          return;
        }
        const name = prompt("저수지/낚시터 이름을 입력하세요:");
        if (!name?.trim()) return;
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.from("fishing_spots").insert({
          name: name.trim(),
          lat: e.coord.lat(),
          lng: e.coord.lng(),
        });
        onSpotsChangedRef.current?.();
        loadMarkers();
      });

      // 데스크탑: 우클릭 → 즐겨찾기 커스텀 핀
      naver.maps.Event.addListener(mapRef.current, "rightclick", (e: any) => {
        if (editModeRef.current) return;
        onLongPressRef.current?.(e.coord.lat(), e.coord.lng());
      });

      // 모바일: 길게 누르기 (600ms) → 즐겨찾기 커스텀 핀
      let longPressTimer: ReturnType<typeof setTimeout> | null = null;
      let touchMoved = false;

      containerRef.current!.addEventListener("touchstart", (e) => {
        if (editModeRef.current) return;
        touchMoved = false;
        const touch = e.touches[0];
        longPressTimer = setTimeout(() => {
          if (touchMoved) return;
          const rect = containerRef.current!.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          const coord = mapRef.current.fromContainerPixelToCoord(
            new naver.maps.Point(x, y)
          );
          onLongPressRef.current?.(coord.lat(), coord.lng());
        }, 600);
      }, { passive: true });

      containerRef.current!.addEventListener("touchmove", () => {
        touchMoved = true;
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      }, { passive: true });

      containerRef.current!.addEventListener("touchend", () => {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      }, { passive: true });
    }

    if (window.naver?.maps) {
      initMap();
    } else {
      const existing = document.querySelector("script[data-naver-maps]");
      if (existing) {
        existing.addEventListener("load", initMap);
      } else {
        const script = document.createElement("script");
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
        script.setAttribute("data-naver-maps", "");
        script.async = true;
        script.onload = initMap;
        document.head.appendChild(script);
      }
    }
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
