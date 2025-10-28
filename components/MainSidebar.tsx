"use client";

import { CSSProperties, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
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

// Convert icon name to PascalCase for Lucide icon lookup
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const iconFor = (iconName?: string): React.ComponentType<any> => {
  if (!iconName) return LucideIcons.MapPin as React.ComponentType<any>;
  
  // Handle special cases
  if (iconName === "barbers") return LucideIcons.Users as React.ComponentType<any>;
  if (iconName === "services") return LucideIcons.Scissors as React.ComponentType<any>;
  
  // Convert kebab-case to PascalCase (e.g., "map-pin" -> "MapPin")
  const iconKey = toPascalCase(iconName) as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[iconKey];
  
  // Return the icon if it exists, otherwise return default
  return (IconComponent && typeof IconComponent !== 'string' ? IconComponent : LucideIcons.MapPin) as React.ComponentType<any>;
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
  const [isHovered, setIsHovered] = useState(false);

  // Keyboard shortcut: Ctrl+B (Windows/Linux) or Cmd+B (Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen shrink-0 flex flex-col border-r-0 transition-all duration-300 relative group z-40 overflow-hidden",
        isCollapsed ? "w-[70px]" : "w-[220px]",
        className
      )}
      style={{
        ...style,
        backgroundColor: bgColor,
        color: textColor,
        position: 'fixed',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapse Toggle Button - Only show on hover */}
      <div 
        className={cn(
          "absolute top-4 -right-3 z-50 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="relative group/tooltip">
          <button
            onClick={toggleSidebar}
            className="rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
            style={{
              color: textColor,
              backgroundColor: bgColor,
              border: `2px solid ${textColor}40`
            }}
            aria-label={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          
          {/* Tooltip */}
          <div 
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50"
            style={{
              backgroundColor: bgColor,
              color: textColor,
              border: `1px solid ${textColor}20`
            }}
          >
            <div className="text-xs font-semibold">
              {isCollapsed ? "Expand" : "Collapse"} Sidebar
            </div>
            <div className="text-[10px] opacity-70 mt-0.5">
              {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + B
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="border-b pb-4 px-2 pt-4" style={{ borderColor: `${textColor}20` }}>
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
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
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
            <LucideIcons.User className="w-5 h-5" />
          </Link>
        )}
      </div>
    </aside>
  );
}

