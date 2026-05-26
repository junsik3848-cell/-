"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

const VWORLD_KEY = process.env.NEXT_PUBLIC_VWORLD_KEY ?? "";

interface Props {
  year: string;
}

export default function AerialMap({ year }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.TileLayer | L.TileLayer.WMS | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [36.5, 127.5],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);

    layerRef.current = buildLayer(year);
    layerRef.current.addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (layerRef.current) map.removeLayer(layerRef.current);
    layerRef.current = buildLayer(year);
    layerRef.current.addTo(map);
  }, [year]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function buildLayer(year: string): L.TileLayer | L.TileLayer.WMS {
  if (!VWORLD_KEY) {
    // API 키 없을 때 OpenStreetMap fallback
    return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    });
  }

  if (year === "현재") {
    // Vworld WMTS — 최신 위성사진 (타일 순서: z/y/x)
    return L.tileLayer(
      `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
      {
        maxZoom: 19,
        tileSize: 256,
        attribution: "© 국토지리정보원",
      }
    );
  }

  // Vworld WMS — 연도별 항공사진
  // TIME 파라미터로 해당 연도 항공사진 요청
  const domain = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return (L.tileLayer.wms as Function)("https://api.vworld.kr/req/wms", {
    layers: "photo",
    format: "image/jpeg",
    transparent: false,
    version: "1.3.0",
    key: VWORLD_KEY,
    domain,
    TIME: year,
    maxZoom: 19,
    attribution: "© 국토지리정보원",
  }) as L.TileLayer.WMS;
}
