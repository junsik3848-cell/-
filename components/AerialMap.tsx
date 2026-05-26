"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

const VWORLD_KEY = process.env.NEXT_PUBLIC_VWORLD_KEY ?? "";

// ESRI World Imagery Wayback — 연도별 스냅샷 M값
// https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{M}/{z}/{y}/{x}
const WAYBACK_M: Record<string, number> = {
  "2023": 56102, // 2023-12-07
  "2021": 26120, // 2021-12-21
  "2019": 4756,  // 2019-12-12
  "2017": 25521, // 2017-11-16
  "2015": 28163, // 2015-12-16 (가뭄 심한 해)
};

interface Props {
  year: string;
}

export default function AerialMap({ year }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.TileLayer | null>(null);

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

function buildLayer(year: string): L.TileLayer {
  if (year === "현재") {
    // Vworld WMTS — 최신 고해상도 한국 위성사진 (타일 순서: z/y/x)
    if (VWORLD_KEY) {
      return L.tileLayer(
        `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
        {
          maxZoom: 19,
          tileSize: 256,
          attribution: "© 국토지리정보원",
        }
      );
    }
    // Vworld 키 없을 때 ESRI 최신으로 fallback
    return esriCurrentLayer();
  }

  const m = WAYBACK_M[year];
  if (m) {
    // ESRI World Imagery Wayback — 연도별 위성사진 (무료, 인증 불필요)
    // 타일 순서: z/y/x (row/col)
    return L.tileLayer(
      `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${m}/{z}/{y}/{x}`,
      {
        maxZoom: 19,
        tileSize: 256,
        attribution: "© Esri, Maxar, Earthstar Geographics",
      }
    );
  }

  return esriCurrentLayer();
}

function esriCurrentLayer(): L.TileLayer {
  return L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      tileSize: 256,
      attribution: "© Esri, Maxar, Earthstar Geographics",
    }
  );
}
