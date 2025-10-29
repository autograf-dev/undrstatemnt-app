"use client";

import { CSSProperties, ReactNode } from "react";
import MainHeader, { HeaderNavItem } from "./MainHeader";
import { cn } from "@/lib/utils";

export interface PageShellWithHeaderProps {
  className?: string;
  style?: CSSProperties;
  /** Logo URL for header */
  logoSrc?: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Logo height in pixels */
  logoHeight?: number;
  /** Business name for header */
  title?: string;
  /** Header nav items */
  headerItems?: HeaderNavItem[];
  /** Active href to highlight in header */
  activeHref?: string;
  /** Sign-in button label */
  signInLabel?: string;
  /** Sign-in link */
  signInHref?: string;
  /** Header background color (with opacity for glassy effect) */
  headerBgColor?: string;
  /** Header text color */
  headerTextColor?: string;
  /** Active item color */
  headerActiveColor?: string;
  /** Hover color */
  headerHoverColor?: string;
  /** Sign-in button background color */
  buttonBgColor?: string;
  /** Sign-in button text color */
  buttonTextColor?: string;
  // Mobile Footer Nav Configuration
  /** Show center booking button (mobile footer only) */
  showMobileBookingButton?: boolean;
  /** Center booking button link (mobile footer only) */
  mobileBookingHref?: string;
  /** Center booking button color (mobile footer only) */
  mobileBookingColor?: string;
  /** Booking button glow opacity (mobile footer only) */
  mobileBookingGlowOpacity?: number;
  /** Show user/signup icon (mobile footer only) */
  showMobileUserIcon?: boolean;
  /** User/signup link (mobile footer only) */
  mobileUserHref?: string;
  /** Footer background color (mobile footer only) */
  mobileFooterBgColor?: string;
  /** Icon color inactive (mobile footer only) */
  mobileFooterIconColor?: string;
  /** Icon color active (mobile footer only) */
  mobileFooterActiveIconColor?: string;
  /** Icon size in pixels (mobile footer only) */
  mobileFooterIconSize?: number;
  /** Footer padding (mobile footer only) */
  mobileFooterPadding?: string;
  /** Main page content (slot from Plasmic) */
  children?: ReactNode;
}

export default function PageShellWithHeader({
  className,
  style,
  logoSrc,
  logoWidth,
  logoHeight,
  title,
  headerItems,
  activeHref,
  signInLabel,
  signInHref,
  headerBgColor,
  headerTextColor,
  headerActiveColor,
  headerHoverColor,
  buttonBgColor,
  buttonTextColor,
  // Mobile Footer Nav
  showMobileBookingButton,
  mobileBookingHref,
  mobileBookingColor,
  mobileBookingGlowOpacity,
  showMobileUserIcon,
  mobileUserHref,
  mobileFooterBgColor,
  mobileFooterIconColor,
  mobileFooterActiveIconColor,
  mobileFooterIconSize,
  mobileFooterPadding,
  children,
}: PageShellWithHeaderProps) {
  // Ensure headerItems is always an array
  const validHeaderItems = Array.isArray(headerItems) ? headerItems : [];

  return (
    <div className={cn("bg-gray-50", className)} style={style}>
      <MainHeader
        logoSrc={logoSrc}
        logoWidth={logoWidth}
        logoHeight={logoHeight}
        title={title}
        items={validHeaderItems}
        activeHref={activeHref}
        signInLabel={signInLabel}
        signInHref={signInHref}
        bgColor={headerBgColor}
        textColor={headerTextColor}
        activeColor={headerActiveColor}
        hoverColor={headerHoverColor}
        buttonBgColor={buttonBgColor}
        buttonTextColor={buttonTextColor}
        // Mobile Footer Nav
        showMobileBookingButton={showMobileBookingButton}
        mobileBookingHref={mobileBookingHref}
        mobileBookingColor={mobileBookingColor}
        mobileBookingGlowOpacity={mobileBookingGlowOpacity}
        showMobileUserIcon={showMobileUserIcon}
        mobileUserHref={mobileUserHref}
        mobileFooterBgColor={mobileFooterBgColor}
        mobileFooterIconColor={mobileFooterIconColor}
        mobileFooterActiveIconColor={mobileFooterActiveIconColor}
        mobileFooterIconSize={mobileFooterIconSize}
        mobileFooterPadding={mobileFooterPadding}
      />
      
      {/* Main content area with top padding for header on desktop, bottom padding for mobile */}
      <main className="pt-24 pb-24 md:pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

