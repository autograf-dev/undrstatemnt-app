"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  className?: string;
  style?: CSSProperties;
  /** Logo image */
  logoSrc?: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Logo height in pixels */
  logoHeight?: number;
  /** Logo background color */
  logoBgColor?: string;
  /** Logo border color */
  logoBorderColor?: string;
  /** Business name/title */
  title?: string;
  /** Title font size */
  titleSize?: string;
  /** Title color */
  titleColor?: string;
  /** Subtitle/address */
  subtitle?: string;
  /** Subtitle color */
  subtitleColor?: string;
  /** Button text */
  buttonText?: string;
  /** Button link */
  buttonHref?: string;
  /** Button icon */
  buttonIcon?: string;
  /** Button background color */
  buttonBgColor?: string;
  /** Button text color */
  buttonTextColor?: string;
  /** Button hover color */
  buttonHoverColor?: string;
  /** Container background color */
  containerBgColor?: string;
  /** Container border color */
  containerBorderColor?: string;
  /** Shadow color */
  shadowColor?: string;
  /** Shadow blur */
  shadowBlur?: number;
  /** Shadow spread */
  shadowSpread?: number;
}

// Convert icon name to PascalCase for Lucide icon lookup
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const getIcon = (iconName?: string): React.ComponentType<any> => {
  if (!iconName) return LucideIcons.Scissors as React.ComponentType<any>;
  
  const iconKey = toPascalCase(iconName) as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[iconKey];
  
  return (IconComponent && typeof IconComponent !== 'string' ? IconComponent : LucideIcons.Scissors) as React.ComponentType<any>;
};

export default function HeroSection({
  className,
  style,
  logoSrc = "/next.svg",
  logoWidth = 120,
  logoHeight = 120,
  logoBgColor = "white",
  logoBorderColor = "#D4A574",
  title = "UNDRSTATEMNT CO.",
  titleSize = "3rem",
  titleColor = "#1a1a1a",
  subtitle = "1309 Edmonton Trl, Calgary, AB T2E 4Y8",
  subtitleColor = "#666666",
  buttonText = "Make a Booking",
  buttonHref = "/booking",
  buttonIcon = "scissors",
  buttonBgColor = "#D97639",
  buttonTextColor = "white",
  buttonHoverColor = "#C06020",
  containerBgColor = "rgba(255, 255, 255, 0.8)",
  containerBorderColor = "rgba(255, 255, 255, 0.3)",
  shadowColor = "rgba(0, 0, 0, 0.15)",
  shadowBlur = 40,
  shadowSpread = 8,
}: HeroSectionProps) {
  const ButtonIcon = getIcon(buttonIcon);

  return (
    <section
      className={cn("w-full", className)}
      style={style}
    >
      {/* Glassy Container with rounded corners */}
      <div 
        className="w-full rounded-2xl p-6 md:p-10 lg:p-12"
        style={{
          backgroundColor: containerBgColor,
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          border: `1px solid ${containerBorderColor}`,
          boxShadow: `0 ${shadowSpread}px ${shadowBlur}px 0 ${shadowColor}`,
        }}
      >
        <div className="text-center">
          {/* Logo - Responsive sizing */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div
              className="rounded-full flex items-center justify-center overflow-hidden shadow-2xl"
              style={{
                width: `min(${logoWidth}px, 35vw)`,
                height: `min(${logoHeight}px, 35vw)`,
                maxWidth: logoWidth,
                maxHeight: logoHeight,
                backgroundColor: logoBgColor,
                border: `3px solid ${logoBorderColor}`,
              }}
            >
              <Image
                src={logoSrc || "/next.svg"}
                alt={title}
                width={logoWidth}
                height={logoHeight}
                className="object-contain p-2"
                unoptimized={logoSrc?.startsWith('http') || logoSrc?.startsWith('data:')}
              />
            </div>
          </div>

          {/* Title - Responsive text sizing */}
          <h1
            className="font-extrabold tracking-wider uppercase mb-4 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            style={{
              color: titleColor,
              letterSpacing: '0.1em',
            }}
          >
            {title}
          </h1>

          {/* Subtitle - Responsive text */}
          <p
            className="text-sm sm:text-base md:text-lg mb-6 md:mb-8 px-4"
            style={{
              color: subtitleColor,
            }}
          >
            {subtitle}
          </p>

          {/* CTA Button - Mobile optimized */}
          <Link
            href={buttonHref}
            className="relative inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 overflow-hidden group"
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = buttonHoverColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonBgColor;
            }}
          >
            {/* Gradient shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <span className="relative z-10 flex items-center gap-2 md:gap-3">
              <ButtonIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span>{buttonText}</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

