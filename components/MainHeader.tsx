"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { Menu, X, Plus, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface HeaderNavItem {
  label: string;
  href: string;
  icon?: string | React.ReactNode; // Support both string (from Plasmic) and ReactNode (from code)
}

// Convert icon name to PascalCase for Lucide icon lookup
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Helper function to get icon component from string name (for Plasmic integration)
const getIconComponent = (iconName?: string | React.ReactNode): React.ReactNode => {
  // If it's already a ReactNode (JSX element), return it directly
  if (typeof iconName !== 'string') {
    return iconName;
  }
  
  if (!iconName) return null;
  
  // Handle special cases
  if (iconName === "barbers") {
    const Icon = LucideIcons.Users;
    return <Icon className="w-5 h-5" />;
  }
  if (iconName === "services") {
    const Icon = LucideIcons.Scissors;
    return <Icon className="w-5 h-5" />;
  }
  
  // Convert kebab-case to PascalCase (e.g., "map-pin" -> "MapPin")
  const iconKey = toPascalCase(iconName) as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[iconKey];
  
  // Return the icon if it exists, otherwise return Home as default
  if (IconComponent && typeof IconComponent !== 'string') {
    const Icon = IconComponent as React.ComponentType<{ className?: string }>;
    return <Icon className="w-5 h-5" />;
  }
  
  const DefaultIcon = LucideIcons.Home;
  return <DefaultIcon className="w-5 h-5" />;
};

export interface MainHeaderProps {
  /** Logo URL */
  logoSrc?: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Logo height in pixels */
  logoHeight?: number;
  /** Business name */
  title?: string;
  /** Navigation items */
  items?: HeaderNavItem[];
  /** Active href to highlight */
  activeHref?: string;
  /** Sign-in button label */
  signInLabel?: string;
  /** Sign-in link */
  signInHref?: string;
  /** Header background color (with opacity for glassy effect) */
  bgColor?: string;
  /** Text color */
  textColor?: string;
  /** Active item color */
  activeColor?: string;
  /** Hover color */
  hoverColor?: string;
  /** Button background color */
  buttonBgColor?: string;
  /** Button text color */
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
  /** Hide/fade mobile footer (e.g., when drawer open) */
  mobileFooterHidden?: boolean;
}

export default function MainHeader({
  logoSrc = "/logo.png",
  logoWidth = 50,
  logoHeight = 50,
  title = "UNDERSTATEMENT",
  items = [],
  activeHref,
  signInLabel = "Sign In",
  signInHref = "/signin",
  bgColor = "rgba(255, 255, 255, 0.8)",
  textColor = "#1a1a1a",
  activeColor = "#000000",
  hoverColor = "rgba(0, 0, 0, 0.05)",
  buttonBgColor = "#000000",
  buttonTextColor = "#ffffff",
  // Mobile Footer Nav
  showMobileBookingButton = true,
  mobileBookingHref = "/booking",
  mobileBookingColor = "#D97639",
  mobileBookingGlowOpacity = 0.3,
  showMobileUserIcon = true,
  mobileUserHref = "/signin",
  mobileFooterBgColor = "rgba(255, 255, 255, 0.8)",
  mobileFooterIconColor = "#1a1a1a",
  mobileFooterActiveIconColor = "#000000",
  mobileFooterIconSize = 24,
  mobileFooterPadding = "0.75rem",
  mobileFooterHidden = false,
}: MainHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Header */}
      <header
        className="fixed top-4 left-1/2 -translate-x-1/2 z-999999 w-[95%] max-w-7xl hidden md:block"
        style={{
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
        }}
      >
        <div
          className="rounded-2xl shadow-2xl border border-white/30"
          style={{
            backgroundColor: bgColor,
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 transition-all duration-200 hover:opacity-80">
              {logoSrc && (
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center shadow-lg"
                  style={{
                    width: logoWidth,
                    height: logoHeight,
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={logoWidth}
                    height={logoHeight}
                    className="object-contain p-1"
                    unoptimized={logoSrc.startsWith('http') || logoSrc.startsWith('data:')}
                  />
                </div>
              )}
              {title && (
                <span
                  className="font-bold text-lg tracking-tight"
                  style={{ color: textColor }}
                >
                  {title}
                </span>
              )}
            </Link>

            {/* Navigation with Gradient Hover */}
            <nav className="flex items-center gap-2">
              {items.map((item, idx) => {
                const isActive = activeHref === item.href;
                const icon = getIconComponent(item.icon);
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={cn(
                      "group relative px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium text-sm overflow-hidden",
                      isActive ? "shadow-lg" : "hover:shadow-md"
                    )}
                    style={{
                      color: isActive ? activeColor : textColor,
                      backgroundColor: isActive
                        ? "rgba(0, 0, 0, 0.1)"
                        : "transparent",
                      fontWeight: isActive ? "600" : "500",
                    }}
                  >
                    {/* Gradient hover effect */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      !isActive && "bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10"
                    )} />
                    
                    {/* Content */}
                    <span className="relative z-10 flex items-center gap-2">
                      {icon}
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Sign In Button with Gradient */}
            {signInLabel && signInHref && (
              <Link
                href={signInHref}
                className="relative px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden group"
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                }}
              >
                {/* Gradient shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10">{signInLabel}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header - Bottom Navigation */}
      <header className="md:hidden fixed inset-x-0 z-99999">
        {/* Top Bar with Enhanced Glassy Effect */}
        <div
          className="mx-4 mt-4 rounded-2xl shadow-2xl border border-white/30"
          style={{
            backgroundColor: bgColor,
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          }}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Logo and Title */}
            <Link href="/" className="flex items-center gap-2 transition-all duration-200 active:scale-95">
              {logoSrc && (
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center shadow-lg"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain p-1"
                    unoptimized={logoSrc.startsWith('http') || logoSrc.startsWith('data:')}
                  />
                </div>
              )}
              {title && (
                <span
                  className="font-bold text-sm tracking-tight"
                  style={{ color: textColor }}
                >
                  {title}
                </span>
              )}
            </Link>

            {/* Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg transition-all duration-200 active:scale-90"
              style={{ color: textColor }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            className="mx-4 mt-2 rounded-2xl shadow-2xl border border-white/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              backgroundColor: bgColor,
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
            }}
          >
            <nav className="p-2">
              {items.map((item, idx) => {
                const isActive = activeHref === item.href;
                const icon = getIconComponent(item.icon);
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm mb-1 overflow-hidden"
                    )}
                    style={{
                      color: isActive ? activeColor : textColor,
                      backgroundColor: isActive
                        ? "rgba(0, 0, 0, 0.1)"
                        : "transparent",
                      fontWeight: isActive ? "600" : "500",
                    }}
                  >
                    {/* Gradient hover effect */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-150",
                      !isActive && "bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10"
                    )} />
                    
                    <span className="relative z-10">{icon}</span>
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
              {signInLabel && signInHref && (
                <Link
                  href={signInHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative mt-2 flex items-center justify-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 overflow-hidden group"
                  style={{
                    backgroundColor: buttonBgColor,
                    color: buttonTextColor,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-active:translate-x-[100%] transition-transform duration-300" />
                  <span className="relative z-10">{signInLabel}</span>
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* Bottom Navigation Bar - ICONS ONLY */}
        <div
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md rounded-2xl shadow-2xl border border-white/30 transition-all duration-300",
            mobileFooterHidden ? "translate-y-8 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
          )}
          style={{
            backgroundColor: mobileFooterBgColor,
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          }}
        >
          <nav className="flex items-center justify-around" style={{ padding: mobileFooterPadding }}>
            {/* First 2 menu items */}
            {items.slice(0, 2).map((item, idx) => {
              const isActive = activeHref === item.href;
              const icon = getIconComponent(item.icon);
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 overflow-hidden",
                    isActive ? "scale-110" : "hover:scale-105"
                  )}
                  style={{
                    color: isActive ? mobileFooterActiveIconColor : mobileFooterIconColor,
                    backgroundColor: isActive
                      ? "rgba(0, 0, 0, 0.1)"
                      : "transparent",
                  }}
                >
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    isActive 
                      ? "opacity-100 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20" 
                      : "opacity-0 group-active:opacity-100 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10"
                  )} />
                  
                  <span 
                    className="relative z-10 flex items-center justify-center"
                    style={{
                      width: `${mobileFooterIconSize}px`,
                      height: `${mobileFooterIconSize}px`,
                    }}
                  >
                    {icon}
                  </span>
                </Link>
              );
            })}

            {/* Center Plus Icon for Booking (PROMINENT) */}
            {showMobileBookingButton && (
              <Link
                href={mobileBookingHref}
                className="group relative flex items-center justify-center rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                style={{
                  backgroundColor: mobileBookingColor,
                  width: '56px',
                  height: '56px',
                }}
              >
                <Plus className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
                
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-full blur-md"
                  style={{ 
                    backgroundColor: mobileBookingColor,
                    opacity: mobileBookingGlowOpacity 
                  }}
                />
              </Link>
            )}

            {/* Next 2 menu items */}
            {items.slice(2, 4).map((item, idx) => {
              const isActive = activeHref === item.href;
              const icon = getIconComponent(item.icon);
              return (
                <Link
                  key={idx + 2}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 overflow-hidden",
                    isActive ? "scale-110" : "hover:scale-105"
                  )}
                  style={{
                    color: isActive ? mobileFooterActiveIconColor : mobileFooterIconColor,
                    backgroundColor: isActive
                      ? "rgba(0, 0, 0, 0.1)"
                      : "transparent",
                  }}
                >
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    isActive 
                      ? "opacity-100 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20" 
                      : "opacity-0 group-active:opacity-100 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10"
                  )} />
                  
                  <span 
                    className="relative z-10 flex items-center justify-center"
                    style={{
                      width: `${mobileFooterIconSize}px`,
                      height: `${mobileFooterIconSize}px`,
                    }}
                  >
                    {icon}
                  </span>
                </Link>
              );
            })}

            {/* User/Signup Icon at the end */}
            {showMobileUserIcon && (
              <Link
                href={mobileUserHref}
                className={cn(
                  "group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 overflow-hidden hover:scale-105",
                  activeHref === mobileUserHref ? "scale-110" : ""
                )}
                style={{
                  color: activeHref === mobileUserHref ? mobileFooterActiveIconColor : mobileFooterIconColor,
                  backgroundColor: activeHref === mobileUserHref
                    ? "rgba(0, 0, 0, 0.1)"
                    : "transparent",
                }}
              >
                <div className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  activeHref === mobileUserHref
                    ? "opacity-100 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20" 
                    : "opacity-0 group-active:opacity-100 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10"
                )} />
                
                <span 
                  className="relative z-10 flex items-center justify-center"
                  style={{
                    width: `${mobileFooterIconSize}px`,
                    height: `${mobileFooterIconSize}px`,
                  }}
                >
                  <User style={{ width: `${mobileFooterIconSize - 4}px`, height: `${mobileFooterIconSize - 4}px` }} />
                </span>
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

