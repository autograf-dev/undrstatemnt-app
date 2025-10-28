"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export interface CTASectionProps {
  className?: string;
  style?: CSSProperties;
  /** Main heading */
  heading?: string;
  /** Heading color */
  headingColor?: string;
  /** Heading font size */
  headingSize?: string;
  /** Subtext/description */
  subtext?: string;
  /** Subtext color */
  subtextColor?: string;
  /** Subtext font size */
  subtextSize?: string;
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
  /** Border color */
  borderColor?: string;
  /** Section padding */
  padding?: string;
  /** Section margin (top and bottom) */
  margin?: string;
  /** Maximum width */
  maxWidth?: string;
}

// Convert icon name to PascalCase for Lucide icon lookup
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const getIcon = (iconName?: string): React.ComponentType<any> => {
  if (!iconName) return LucideIcons.Phone as React.ComponentType<any>;
  
  const iconKey = toPascalCase(iconName) as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[iconKey];
  
  return (IconComponent && typeof IconComponent !== 'string' ? IconComponent : LucideIcons.Phone) as React.ComponentType<any>;
};

export default function CTASection({
  className,
  style,
  heading = "Have a question? Contact us!",
  headingColor = "#1a1a1a",
  headingSize = "1.75rem",
  subtext = "Call by clicking the button on the right →",
  subtextColor = "#666666",
  subtextSize = "1.125rem",
  buttonText = "Call us",
  buttonHref = "tel:+14031234567",
  buttonIcon = "phone",
  buttonBgColor = "#D97639",
  buttonTextColor = "white",
  buttonHoverColor = "#C06020",
  bgColor = "white",
  borderColor = "#e5e7eb",
  padding = "2.5rem 3rem",
  margin = "3rem 0",
  maxWidth = "1280px",
}: CTASectionProps) {
  const ButtonIcon = getIcon(buttonIcon);

  return (
    <section
      className={cn("w-full px-4", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
        margin,
      }}
    >
      <div
        className="mx-auto rounded-2xl border flex items-center justify-between gap-8 flex-wrap lg:flex-nowrap"
        style={{
          padding,
          borderColor,
          maxWidth,
        }}
      >
        {/* Text Content */}
        <div className="flex-1">
          <h2
            className="font-bold mb-2"
            style={{
              fontSize: headingSize,
              color: headingColor,
            }}
          >
            {heading}
          </h2>
          <p
            style={{
              fontSize: subtextSize,
              color: subtextColor,
            }}
          >
            {subtext}
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href={buttonHref}
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-300 hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
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

