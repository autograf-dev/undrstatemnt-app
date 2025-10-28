"use client";

import { CSSProperties, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Scissors, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon?: "home" | "barbers" | "services" | "custom";
}

export interface MainSidebarProps {
  className?: string;
  style?: CSSProperties;
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoBgColor?: string;
  title?: string;
  subtitle?: string;
  items?: SidebarNavItem[];
  activeHref?: string;
  signInLabel?: string;
  signInHref?: string;
  bgColor?: string;
  textColor?: string;
  activeBgColor?: string;
  hoverBgColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  defaultCollapsed?: boolean;
}

const iconFor = (key?: SidebarNavItem["icon"]) => {
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
  logoWidth = 80,
  logoHeight = 80,
  logoBgColor = "rgba(255, 255, 255, 0.1)",
  title = "Undrstatemnt",
  subtitle = "1309 Edmonton Trl, Calgary, AB T2E 4Y8",
  items = [
    { id: "home", label: "Home", href: "/", icon: "home" },
    { id: "barbers", label: "Barbers", href: "/barbers", icon: "barbers" },
    { id: "services", label: "Services", href: "/services", icon: "services" },
  ],
  activeHref,
  signInLabel = "Sign In",
  signInHref = "/login",
  bgColor = "#391709",
  textColor = "white",
  activeBgColor = "rgba(255, 255, 255, 0.15)",
  hoverBgColor = "rgba(255, 255, 255, 0.1)",
  buttonBgColor = "white",
  buttonTextColor = "#391709",
  defaultCollapsed = false,
}: MainSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={cn(
        "h-screen shrink-0 flex flex-col border-r-0 transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[220px]",
        className
      )}
      style={{
        ...style,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {/* Collapse Toggle Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-1.5 transition-colors hover:bg-opacity-20"
          style={{
            color: textColor,
            backgroundColor: hoverBgColor,
          }}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Header */}
      <div className="border-b pb-4 px-2" style={{ borderColor: `${textColor}20` }}>
        <div className="flex flex-col items-center gap-3">
          <div 
            className={cn(
              "relative rounded-full ring-2 overflow-hidden flex items-center justify-center transition-all",
              isCollapsed ? "w-10 h-10" : "w-20 h-20"
            )}
            style={{ 
              backgroundColor: logoBgColor,
              borderColor: `${textColor}40`
            }}
          >
            <Image
              src={logoSrc || "/next.svg"}
              alt="logo"
              width={isCollapsed ? 40 : logoWidth}
              height={isCollapsed ? 40 : logoHeight}
              className="object-contain p-2"
              unoptimized={logoSrc?.startsWith('http')}
            />
          </div>
          {!isCollapsed && (
            <div className="text-center w-full">
              <h2 className="text-sm font-extrabold tracking-wider uppercase" style={{ color: textColor }}>
                {title}
              </h2>
              <p className="text-[11px] mt-1 leading-tight" style={{ color: textColor, opacity: 0.7 }}>
                {subtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = iconFor(item.icon);
            const active = activeHref ? activeHref === item.href : false;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition-all",
                    isCollapsed ? "justify-center" : "gap-2"
                  )}
                  style={{
                    color: textColor,
                    backgroundColor: active ? activeBgColor : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = hoverBgColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Sign In Button */}
      <div className="border-t pt-4 px-2 pb-4" style={{ borderColor: `${textColor}20` }}>
        {!isCollapsed ? (
          <Link
            href={signInHref}
            className="w-full inline-flex items-center justify-center rounded-lg font-semibold text-sm py-2.5 px-4 transition-opacity hover:opacity-90"
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
          >
            {signInLabel}
          </Link>
        ) : (
          <Link
            href={signInHref}
            className="w-full inline-flex items-center justify-center rounded-lg font-semibold text-sm py-2.5 transition-opacity hover:opacity-90"
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
            title={signInLabel}
          >
            <Users className="w-5 h-5" />
          </Link>
        )}
      </div>
    </aside>
  );
}

