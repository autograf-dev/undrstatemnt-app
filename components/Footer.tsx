"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface FooterProps {
  className?: string;
  style?: CSSProperties;
  /** Logo image */
  logoSrc?: string;
  /** Logo width */
  logoWidth?: number;
  /** Logo height */
  logoHeight?: number;
  /** Business name */
  businessName?: string;
  /** Business name color */
  businessNameColor?: string;
  /** Business name size */
  businessNameSize?: string;
  /** Address line 1 */
  address?: string;
  /** Address color */
  addressColor?: string;
  /** Address font size */
  addressSize?: string;
  /** Social media links */
  socialLinks?: SocialLink[];
  /** Social icon size */
  socialIconSize?: number;
  /** Social icon color */
  socialIconColor?: string;
  /** Social button background */
  socialBgColor?: string;
  /** Social button hover color */
  socialHoverColor?: string;
  /** Background color */
  bgColor?: string;
  /** Section padding */
  padding?: string;
}

// Convert icon name to PascalCase for Lucide icon lookup
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const getIcon = (iconName?: string): React.ComponentType<any> => {
  if (!iconName) return LucideIcons.Globe as React.ComponentType<any>;
  
  // Handle common social media mappings
  if (iconName === "instagram") return LucideIcons.Instagram as React.ComponentType<any>;
  if (iconName === "facebook") return LucideIcons.Facebook as React.ComponentType<any>;
  if (iconName === "twitter") return LucideIcons.Twitter as React.ComponentType<any>;
  if (iconName === "linkedin") return LucideIcons.Linkedin as React.ComponentType<any>;
  if (iconName === "youtube") return LucideIcons.Youtube as React.ComponentType<any>;
  
  const iconKey = toPascalCase(iconName) as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[iconKey];
  
  return (IconComponent && typeof IconComponent !== 'string' ? IconComponent : LucideIcons.Globe) as React.ComponentType<any>;
};

export default function Footer({
  className,
  style,
  logoSrc = "/next.svg",
  logoWidth = 60,
  logoHeight = 60,
  businessName = "UNDRSTATEMNT CO.",
  businessNameColor = "#1a1a1a",
  businessNameSize = "1.5rem",
  address = "1309 EDMONTON TRL, CALGARY, AB T2E 4Y8",
  addressColor = "#D97639",
  addressSize = "0.875rem",
  socialLinks = [
    { id: "instagram", platform: "Instagram", url: "https://instagram.com", icon: "instagram" },
    { id: "facebook", platform: "Facebook", url: "https://facebook.com", icon: "facebook" },
  ],
  socialIconSize = 24,
  socialIconColor = "#D97639",
  socialBgColor = "#FEF3EE",
  socialHoverColor = "#FED7C3",
  bgColor = "#FAFAFA",
  padding = "3rem 2rem",
}: FooterProps) {
  return (
    <footer
      className={cn("w-full border-t", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
        borderTopColor: "#e5e7eb",
      }}
    >
      <div
        className="max-w-7xl mx-auto"
        style={{
          padding,
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Business Info */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="shrink-0">
              <Image
                src={logoSrc || "/next.svg"}
                alt={businessName}
                width={logoWidth}
                height={logoHeight}
                className="object-contain"
                unoptimized={logoSrc?.startsWith('http')}
              />
            </div>

            {/* Business Name & Address */}
            <div>
              <h3
                className="font-bold mb-1"
                style={{
                  fontSize: businessNameSize,
                  color: businessNameColor,
                  letterSpacing: '0.05em',
                }}
              >
                {businessName}
              </h3>
              <p
                className="font-semibold"
                style={{
                  fontSize: addressSize,
                  color: addressColor,
                  letterSpacing: '0.05em',
                }}
              >
                {address}
              </p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const SocialIcon = getIcon(social.icon);
              return (
                <Link
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-2xl transition-all duration-300 hover:shadow-md"
                  style={{
                    width: socialIconSize * 2,
                    height: socialIconSize * 2,
                    backgroundColor: socialBgColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = socialHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = socialBgColor;
                  }}
                  title={social.platform}
                >
                  <SocialIcon 
                    style={{ 
                      width: socialIconSize, 
                      height: socialIconSize,
                      color: socialIconColor,
                    }} 
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

