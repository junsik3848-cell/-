"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HomeIcon,
  MapPinIcon,
  PlusIcon,
  XIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  FishIcon,
} from "./icons";

const navItems = [
  { href: "/feed", icon: HomeIcon, label: "홈" },
  { href: "/map", icon: MapPinIcon, label: "출조" },
  null,
  { href: "/market", icon: ShoppingBagIcon, label: "장비" },
  { href: "/profile", icon: UserCircleIcon, label: "프로필" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      {fabOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setFabOpen(false)} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container border-t border-outline-variant/40 max-w-md mx-auto">
        {fabOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col items-end gap-2.5">
            <Link
              href="/post/new?type=catch"
              onClick={() => setFabOpen(false)}
              className="flex items-center gap-3 bg-surface-container-high px-4 py-3 rounded-2xl shadow-lg whitespace-nowrap"
            >
              <FishIcon size={18} className="text-surface-tint" />
              <span className="text-sm font-semibold text-on-surface">조과 기록하기</span>
            </Link>
            <Link
              href="/post/new?type=market"
              onClick={() => setFabOpen(false)}
              className="flex items-center gap-3 bg-surface-container-high px-4 py-3 rounded-2xl shadow-lg whitespace-nowrap"
            >
              <ShoppingBagIcon size={18} className="text-surface-tint" />
              <span className="text-sm font-semibold text-on-surface">장터 등록하기</span>
            </Link>
          </div>
        )}

        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item, index) => {
            if (!item) {
              return (
                <button
                  key="fab"
                  onClick={() => setFabOpen((v) => !v)}
                  className="flex flex-col items-center justify-center flex-1 h-full"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center glow-mint">
                    {fabOpen
                      ? <XIcon size={24} className="text-on-primary" />
                      : <PlusIcon size={24} className="text-on-primary" />
                    }
                  </div>
                </button>
              );
            }

            const { href, icon: Icon, label } = item;
            const isActive = pathname === href || (href === "/feed" && pathname === "/");

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
              >
                <Icon size={22} className={isActive ? "text-surface-tint" : "text-on-surface-variant"} />
                <span className={`text-[10px] font-medium leading-none ${isActive ? "text-surface-tint" : "text-on-surface-variant"}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-surface-tint absolute bottom-1.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
