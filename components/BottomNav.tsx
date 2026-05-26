"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MapPinIcon,
  PlusIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "./icons";

const navItems = [
  { href: "/feed", icon: HomeIcon, label: "홈" },
  { href: "/map", icon: MapPinIcon, label: "출조" },
  { href: "/post/new", icon: PlusIcon, label: "글쓰기", isFab: true },
  { href: "/market", icon: ShoppingBagIcon, label: "장비" },
  { href: "/profile", icon: UserCircleIcon, label: "프로필" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container border-t border-outline-variant/40 max-w-md mx-auto">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, icon: Icon, label, isFab }) => {
          const isActive = pathname === href || (href === "/feed" && pathname === "/");

          if (isFab) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-surface-tint flex items-center justify-center glow-mint shadow-lg">
                  <Icon size={26} className="text-on-primary" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
            >
              <Icon
                size={22}
                className={isActive ? "text-surface-tint" : "text-on-surface-variant"}
              />
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? "text-surface-tint" : "text-on-surface-variant"
                }`}
              >
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
  );
}
