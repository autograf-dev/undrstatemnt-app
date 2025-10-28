"use client";

import { CSSProperties, ReactNode } from "react";
import MainSidebar, { SidebarItem } from "./MainSidebar";
import { cn } from "@/lib/utils";

export interface PageShellProps {
  className?: string;
  style?: CSSProperties;
  /** Logo URL for sidebar */
  logoSrc?: string;
  /** Business name for sidebar */
  title?: string;
  /** Address for sidebar */
  subtitle?: string;
  /** Sidebar nav items */
  sidebarItems?: SidebarItem[];
  /** Active href to highlight in sidebar */
  activeHref?: string;
  /** Sign-in link */
  signInHref?: string;
  /** Main page content (slot from Plasmic) */
  children?: ReactNode;
}

export default function PageShell({
  className,
  style,
  logoSrc,
  title,
  subtitle,
  sidebarItems,
  activeHref,
  signInHref,
  children,
}: PageShellProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden", className)} style={style}>
      <MainSidebar
        logoSrc={logoSrc}
        title={title}
        subtitle={subtitle}
        items={sidebarItems}
        activeHref={activeHref}
        signInHref={signInHref}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}

