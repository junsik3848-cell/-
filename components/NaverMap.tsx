"use client";

import { useEffect, useRef } from "react";

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? "";

declare global {
  interface Window { naver: any; }
}

export default function NaverMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const didInit = useRef(false);

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
