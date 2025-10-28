"use client";

import { CSSProperties, ReactNode } from "react";
import MainSidebarShadcn, { SidebarNavItem } from "./MainSidebarShadcn";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface PageShellShadcnProps {
  className?: string;
  style?: CSSProperties;
  /** Logo URL for sidebar */
  logoSrc?: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Logo height in pixels */
  logoHeight?: number;
  /** Business name for sidebar */
  title?: string;
  /** Address for sidebar */
  subtitle?: string;
  /** Sidebar nav items */
  sidebarItems?: SidebarNavItem[];
  /** Active href to highlight in sidebar */
  activeHref?: string;
  /** Sign-in button label */
  signInLabel?: string;
  /** Sign-in link */
  signInHref?: string;
  /** Sidebar background color */
  sidebarBgColor?: string;
  /** Sidebar text color */
  sidebarTextColor?: string;
  /** Active item background color */
  sidebarActiveBgColor?: string;
  /** Hover background color */
  sidebarHoverBgColor?: string;
  /** Sign-in button background color */
  buttonBgColor?: string;
  /** Sign-in button text color */
  buttonTextColor?: string;
  /** Show mobile menu trigger */
  showTrigger?: boolean;
  /** Main page content (slot from Plasmic) */
  children?: ReactNode;
}

export default function PageShellShadcn({
  className,
  style,
  logoSrc,
  logoWidth,
  logoHeight,
  title,
  subtitle,
  sidebarItems,
  activeHref,
  signInLabel,
  signInHref,
  sidebarBgColor,
  sidebarTextColor,
  sidebarActiveBgColor,
  sidebarHoverBgColor,
  buttonBgColor,
  buttonTextColor,
  showTrigger = true,
  children,
}: PageShellShadcnProps) {
  return (
    <SidebarProvider>
      <MainSidebarShadcn
        logoSrc={logoSrc}
        logoWidth={logoWidth}
        logoHeight={logoHeight}
        title={title}
        subtitle={subtitle}
        items={sidebarItems}
        activeHref={activeHref}
        signInLabel={signInLabel}
        signInHref={signInHref}
        bgColor={sidebarBgColor}
        textColor={sidebarTextColor}
        activeBgColor={sidebarActiveBgColor}
        hoverBgColor={sidebarHoverBgColor}
        buttonBgColor={buttonBgColor}
        buttonTextColor={buttonTextColor}
      />
      <SidebarInset className={cn("flex-1", className)} style={style}>
        {showTrigger && (
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

