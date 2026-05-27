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

interface Props {
  onSpotClick?: (spot: SpotRow) => void;
  editMode?: boolean;
  onSpotsChanged?: () => void;
}

export default function NaverMap({ onSpotClick, editMode = false, onSpotsChanged }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const didInit = useRef(false);
  const markersRef = useRef<Map<string, any>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editModeRef = useRef(editMode);
  const onSpotClickRef = useRef(onSpotClick);
  const onSpotsChangedRef = useRef(onSpotsChanged);

  useEffect(() => { editModeRef.current = editMode; }, [editMode]);
  useEffect(() => { onSpotClickRef.current = onSpotClick; }, [onSpotClick]);
  useEffect(() => { onSpotsChangedRef.current = onSpotsChanged; }, [onSpotsChanged]);

  // 편집 모드 바뀌면 마커 재생성
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();
    loadMarkers();
  }, [editMode]); // eslint-disable-line react-hooks/exhaustive-deps

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
        // 드래그 끝 → Supabase UPDATE
        naver.maps.Event.addListener(marker, "dragend", async () => {
          const pos = marker.getPosition();
          await supabase
            .from("fishing_spots")
            .update({ lat: pos.lat(), lng: pos.lng(), updated_at: new Date().toISOString() })
            .eq("id", spot.id);
        });

        // 클릭 → 삭제
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
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: naver.maps.MapTypeControlStyle.BUTTON,
          mapTypeIds: [
            naver.maps.MapTypeId.NORMAL,
            naver.maps.MapTypeId.SATELLITE,
            naver.maps.MapTypeId.HYBRID,
          ],
        },
        logoControl: false,
        zoomControl: true,
        zoomControlOptions: {
          style: naver.maps.ZoomControlStyle.SMALL,
          position: naver.maps.Position.RIGHT_CENTER,
        },
      });

      // 지도 이동/줌 완료 후 마커 갱신 (디바운스 500ms)
      naver.maps.Event.addListener(mapRef.current, "idle", () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(loadMarkers, 500);
      });

      // 편집 모드 — 빈 곳 클릭 시 핀 추가
      naver.maps.Event.addListener(mapRef.current, "click", async (e: any) => {
        if (!editModeRef.current) return;
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
