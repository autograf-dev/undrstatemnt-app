"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface HeaderNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

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
}: MainHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Header */}
      <header
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl hidden md:block"
        style={{
          backgroundColor: bgColor,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          className="rounded-2xl shadow-lg border border-white/20"
          style={{
            backgroundColor: bgColor,
          }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3">
              {logoSrc && (
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center"
                  style={{
                    width: logoWidth,
                    height: logoHeight,
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={logoWidth}
                    height={logoHeight}
                    className="object-contain"
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

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {items.map((item, idx) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                    )}
                    style={{
                      color: isActive ? activeColor : textColor,
                      backgroundColor: isActive
                        ? "rgba(0, 0, 0, 0.08)"
                        : "transparent",
                      fontWeight: isActive ? "600" : "500",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = hoverColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign In Button */}
            {signInLabel && signInHref && (
              <Link
                href={signInHref}
                className="px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105 shadow-md"
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                }}
              >
                {signInLabel}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header - Bottom Navigation */}
      <header className="md:hidden fixed inset-x-0 z-50">
        {/* Top Bar */}
        <div
          className="mx-4 mt-4 rounded-2xl shadow-lg border border-white/20"
          style={{
            backgroundColor: bgColor,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {logoSrc && (
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain"
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
              className="p-2 rounded-lg"
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
            className="mx-4 mt-2 rounded-2xl shadow-lg border border-white/20 overflow-hidden"
            style={{
              backgroundColor: bgColor,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <nav className="p-2">
              {items.map((item, idx) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm mb-1"
                    )}
                    style={{
                      color: isActive ? activeColor : textColor,
                      backgroundColor: isActive
                        ? "rgba(0, 0, 0, 0.08)"
                        : "transparent",
                      fontWeight: isActive ? "600" : "500",
                    }}
                  >
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    {item.label}
                  </Link>
                );
              })}
              {signInLabel && signInHref && (
                <Link
                  href={signInHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex items-center justify-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{
                    backgroundColor: buttonBgColor,
                    color: buttonTextColor,
                  }}
                >
                  {signInLabel}
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md rounded-2xl shadow-lg border border-white/20"
          style={{
            backgroundColor: bgColor,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <nav className="px-2 py-3 flex items-center justify-around">
            {items.slice(0, 5).map((item, idx) => {
              const isActive = activeHref === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
                  )}
                  style={{
                    color: isActive ? activeColor : textColor,
                    backgroundColor: isActive
                      ? "rgba(0, 0, 0, 0.08)"
                      : "transparent",
                  }}
                >
                  {item.icon && <span className="w-6 h-6">{item.icon}</span>}
                  <span
                    className="text-xs font-medium"
                    style={{
                      fontWeight: isActive ? "600" : "500",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}

