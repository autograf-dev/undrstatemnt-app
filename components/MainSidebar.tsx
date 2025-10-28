"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: "home" | "barbers" | "services" | "custom";
}

export interface MainSidebarProps {
  className?: string;
  style?: CSSProperties;
  /** Business logo URL */
  logoSrc?: string;
  /** Business name */
  title?: string;
  /** Address line */
  subtitle?: string;
  /** Menu items */
  items?: SidebarItem[];
  /** Active href to highlight */
  activeHref?: string;
  /** Sign-in URL */
  signInHref?: string;
}

const iconFor = (key?: SidebarItem["icon"]) => {
  switch (key) {
    case "barbers":
      return Users;
    case "services":
      return Scissors;
    case "home":
    default:
      return MapPin;
  }
};

export default function MainSidebar({
  className,
  style,
  logoSrc = "/next.svg",
  title = "UND RSTATEMNT CO.",
  subtitle = "1309 Edmonton Trl, Calgary, AB T2E 4Y8",
  items = [
    { id: "home", label: "Home", href: "/", icon: "home" },
    { id: "barbers", label: "Barbers", href: "/barbers", icon: "barbers" },
    { id: "services", label: "Services", href: "/services", icon: "services" },
  ],
  activeHref,
  signInHref = "/login",
}: MainSidebarProps) {
  return (
    <aside
      className={cn(
        "h-screen w-[220px] shrink-0 bg-[color:var(--color-orange-primary)] text-white p-4 flex flex-col justify-between",
        className
      )}
      style={style}
    >
      <div>
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="relative w-16 h-16 rounded-full ring-2 ring-white/40 overflow-hidden">
            <Image src={logoSrc} alt="logo" fill className="object-contain" />
          </div>
          <div className="text-center">
            <div className="text-sm font-extrabold tracking-wide">{title}</div>
            <div className="text-xs opacity-80">{subtitle}</div>
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {items.map((item) => {
            const Icon = iconFor(item.icon);
            const active = activeHref ? activeHref === item.href : false;
            return (
              <Link
                href={item.href}
                key={item.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                  active ? "bg-white/15" : "hover:bg-white/10"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4">
        <Link
          href={signInHref}
          className="w-full inline-flex items-center justify-center rounded-lg bg-white text-[color:var(--color-orange-primary)] font-semibold text-sm py-2"
        >
          Sign In
        </Link>
      </div>
    </aside>
  );
}


