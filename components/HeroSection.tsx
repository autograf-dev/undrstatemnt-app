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
  /** Background color */
  bgColor?: string;
  /** Container padding top */
  paddingTop?: string;
  /** Container padding bottom */
  paddingBottom?: string;
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
  bgColor = "#f5f5f5",
  paddingTop = "6rem",
  paddingBottom = "6rem",
}: HeroSectionProps) {
  const ButtonIcon = getIcon(buttonIcon);

  return (
    <section
      className={cn("w-full flex items-center justify-center", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
        paddingTop,
        paddingBottom,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            className="rounded-full flex items-center justify-center overflow-hidden"
            style={{
              width: logoWidth,
              height: logoHeight,
              backgroundColor: logoBgColor,
              border: `3px solid ${logoBorderColor}`,
            }}
          >
            <Image
              src={logoSrc || "/next.svg"}
              alt={title}
              width={logoWidth - 20}
              height={logoHeight - 20}
              className="object-contain"
              unoptimized={logoSrc?.startsWith('http')}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-extrabold tracking-wider uppercase mb-4"
          style={{
            fontSize: titleSize,
            color: titleColor,
            letterSpacing: '0.1em',
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg mb-8"
          style={{
            color: subtitleColor,
          }}
        >
          {subtitle}
        </p>

        {/* CTA Button */}
        <Link
          href={buttonHref}
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-300 hover:shadow-lg transform hover:scale-105"
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
          <ButtonIcon className="w-5 h-5" />
          {buttonText}
        </Link>
      </div>
    </section>
  );
}

