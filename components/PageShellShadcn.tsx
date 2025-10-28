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
  /** Show mobile menu trigger */
  showTrigger?: boolean;
  /** Main page content (slot from Plasmic) */
  children?: ReactNode;
}

export default function PageShellShadcn({
  className,
  style,
  logoSrc,
  title,
  subtitle,
  sidebarItems,
  activeHref,
  signInLabel,
  signInHref,
  showTrigger = true,
  children,
}: PageShellShadcnProps) {
  return (
    <SidebarProvider>
      <MainSidebarShadcn
        logoSrc={logoSrc}
        title={title}
        subtitle={subtitle}
        items={sidebarItems}
        activeHref={activeHref}
        signInLabel={signInLabel}
        signInHref={signInHref}
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

