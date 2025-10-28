"use client";

import { CSSProperties, ReactNode } from "react";
import MainSidebar, { SidebarNavItem } from "./MainSidebar";
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
  /** Logo background color */
  logoBgColor?: string;
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
  /** Start sidebar collapsed */
  defaultCollapsed?: boolean;
  /** Main page content (slot from Plasmic) */
  children?: ReactNode;
}

export default function PageShellShadcn({
  className,
  style,
  logoSrc,
  logoWidth,
  logoHeight,
  logoBgColor,
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
  defaultCollapsed,
  children,
}: PageShellShadcnProps) {
  return (
    <div className={cn("min-h-screen", className)} style={style}>
      <MainSidebar
        logoSrc={logoSrc}
        logoWidth={logoWidth}
        logoHeight={logoHeight}
        logoBgColor={logoBgColor}
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
        defaultCollapsed={defaultCollapsed}
      />
      <main className="ml-[220px] bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}

