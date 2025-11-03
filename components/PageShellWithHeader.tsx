"use client";

import { CSSProperties, ReactNode, useEffect, useState, createContext, useContext } from "react";
import MainHeader, { HeaderNavItem } from "./MainHeader";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BookingProvider } from "@/contexts/BookingContext";

// Context for controlling drawer from anywhere
interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  isDrawerOpen: boolean;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function useDrawerControl() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawerControl must be used within PageShellWithHeader");
  }
  return context;
}

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
  // Drawer controls
  /** Open booking as bottom drawer instead of navigating */
  useDrawerForBooking?: boolean;
  /** Drawer title text */
  drawerTitle?: string;
  /** Tailwind classes for drawer top corner radius */
  drawerRadiusClass?: string;
  /** Drawer background color */
  drawerBgColor?: string;
  /** Slot: drawer content (e.g., BookingWidget) */
  drawerContent?: ReactNode;
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
  useDrawerForBooking,
  drawerTitle,
  drawerRadiusClass,
  drawerBgColor,
  drawerContent,
  children,
}: PageShellWithHeaderProps) {
  // Ensure headerItems is always an array
  const validHeaderItems = Array.isArray(headerItems) ? headerItems : [];
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Intercept booking link to open drawer (mobile footer + any header links)
  useEffect(() => {
    if (!useDrawerForBooking) return;
    if (typeof window === "undefined") return;

    const href = mobileBookingHref || "/booking";
    const selector = `a[href='${href}']`;
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(selector));
    const onClick = (e: Event) => {
      e.preventDefault();
      try {
        const scroller = document.querySelector('[data-drawer-scroll]') as HTMLElement | null;
        if (scroller) scroller.scrollTop = 0;
      } catch {}
      setDrawerOpen(true);
      return false;
    };
    links.forEach((el) => el.addEventListener("click", onClick));
    return () => {
      links.forEach((el) => el.removeEventListener("click", onClick));
    };
  }, [useDrawerForBooking, mobileBookingHref]);

  // Reset drawer scroll position to top whenever it opens
  useEffect(() => {
    if (!useDrawerForBooking) return;
    if (!drawerOpen) return;
    // Measure header height and set CSS var for drawer to stay below header
    try {
      const hdr = document.querySelector('header');
      const h = hdr ? Math.ceil((hdr as HTMLElement).getBoundingClientRect().bottom) : 120;
      document.documentElement.style.setProperty('--drawer-top-gap', `${h}px`);
    } catch {}
    const restoreTop = () => {
      const scroller = document.querySelector('[data-drawer-scroll]') as HTMLElement | null;
      if (scroller) {
        scroller.scrollTop = 0;
      }
    };
    const id = window.setTimeout(() => {
      restoreTop();
      requestAnimationFrame(() => {
        restoreTop();
      });
    }, 30);
    return () => window.clearTimeout(id);
  }, [drawerOpen, useDrawerForBooking]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <BookingProvider>
      <DrawerContext.Provider value={{ openDrawer, closeDrawer, isDrawerOpen: drawerOpen }}>
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
        mobileFooterHidden={!!(useDrawerForBooking && drawerOpen)}
      />
      
      {useDrawerForBooking && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent
            roundedClassName={drawerRadiusClass || "rounded-t-2xl"}
            className="border border-white/30"
            style={{ backgroundColor: drawerBgColor || "rgba(255,255,255,0.95)" }}
          >
            <div className="mx-auto w-full max-w-3xl">
              <div className="px-0 sm:px-4 pb-4" key={drawerOpen ? 'open' : 'closed'}>
                {drawerContent}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Main content area with top padding for header on desktop, bottom padding for mobile */}
      <main className="pt-24 pb-24 md:pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
        </div>
      </DrawerContext.Provider>
    </BookingProvider>
  );
}

