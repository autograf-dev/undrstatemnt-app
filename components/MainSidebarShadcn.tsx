"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Scissors, ChevronUp, User2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon?: "home" | "barbers" | "services" | "custom";
}

export interface MainSidebarShadcnProps {
  className?: string;
  style?: CSSProperties;
  /** Business logo URL */
  logoSrc?: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Logo height in pixels */
  logoHeight?: number;
  /** Business name */
  title?: string;
  /** Address line */
  subtitle?: string;
  /** Menu items */
  items?: SidebarNavItem[];
  /** Active href to highlight */
  activeHref?: string;
  /** Sign-in button label */
  signInLabel?: string;
  /** Sign-in URL */
  signInHref?: string;
  /** Sidebar background color */
  bgColor?: string;
  /** Text color for all sidebar text */
  textColor?: string;
  /** Active item background color */
  activeBgColor?: string;
  /** Hover background color */
  hoverBgColor?: string;
  /** Sign-in button background color */
  buttonBgColor?: string;
  /** Sign-in button text color */
  buttonTextColor?: string;
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

export default function MainSidebarShadcn({
  className,
  style,
  logoSrc = "/next.svg",
  logoWidth = 80,
  logoHeight = 80,
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
}: MainSidebarShadcnProps) {
  return (
    <Sidebar
      className={cn("border-r-0", className)}
      style={{
        ...style,
        "--sidebar-background": bgColor,
        "--sidebar-foreground": textColor,
        "--sidebar-primary": textColor,
        "--sidebar-primary-foreground": bgColor,
        "--sidebar-accent": hoverBgColor,
        "--sidebar-accent-foreground": textColor,
        "--sidebar-border": "rgba(255, 255, 255, 0.1)",
      } as CSSProperties}
    >
      <SidebarHeader className="border-b border-white/10 pb-4">
        <div className="flex flex-col items-center gap-3 px-2">
          <div className="relative w-20 h-20 rounded-full ring-2 ring-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
            <Image
              src={logoSrc}
              alt="logo"
              width={logoWidth}
              height={logoHeight}
              className="object-contain p-2"
            />
          </div>
          <div className="text-center w-full">
            <h2 className="text-sm font-extrabold tracking-wider uppercase" style={{ color: textColor }}>
              {title}
            </h2>
            <p className="text-[11px] mt-1 leading-tight" style={{ color: textColor, opacity: 0.7 }}>
              {subtitle}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = iconFor(item.icon);
                const active = activeHref ? activeHref === item.href : false;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "font-semibold transition-colors"
                      )}
                      style={{
                        color: textColor,
                        backgroundColor: active ? activeBgColor : "transparent",
                      }}
                    >
                      <Link href={item.href} style={{ color: textColor }}>
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href={signInHref}
              className="w-full inline-flex items-center justify-center rounded-lg font-semibold text-sm py-2.5 px-4 transition-colors hover:opacity-90"
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              }}
            >
              {signInLabel}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

