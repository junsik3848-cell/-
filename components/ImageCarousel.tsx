"use client";

import { useState, useRef } from "react";

export default function ImageCarousel({
  images,
  aspectClass = "aspect-[4/5]",
}: {
  images: string[];
  aspectClass?: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className={`relative ${aspectClass} overflow-hidden`}>
        <img src={images[0]} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) setIndex((i) => Math.min(i + 1, images.length - 1));
    else setIndex((i) => Math.max(i - 1, 0));
    touchStartX.current = null;
  }

  return (
    <div
      className={`relative ${aspectClass} overflow-hidden select-none`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 슬라이드 트랙 */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ width: `${images.length * 100}%`, transform: `translateX(-${(index / images.length) * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} style={{ width: `${100 / images.length}%` }} className="h-full flex-shrink-0">
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      {/* 장수 표시 (우상단) */}
      <div className="absolute top-3 right-3 bg-black/50 rounded-full px-2.5 py-1 text-white text-[11px] font-semibold">
        {index + 1} / {images.length}
      </div>

      {/* 하단 점 인디케이터 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i === index ? "w-3 h-1 bg-white" : "w-1 h-1 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
