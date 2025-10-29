"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingIcon {
  icon: string;
  size: number;
  color: string;
  top: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
  rotation: number;
  opacity: number;
}

export interface HeroSectionProps {
  className?: string;
  style?: CSSProperties;
  
  // Logo Controls
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
  
  // Text Controls
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
  
  // Button Controls
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
  
  // Container Style
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
  
  // Doodle Images
  /** Show left doodle */
  showLeftDoodle?: boolean;
  /** Left doodle image */
  leftDoodleSrc?: string;
  /** Left doodle width */
  leftDoodleWidth?: number;
  /** Left doodle top position */
  leftDoodleTop?: string;
  /** Left doodle left position */
  leftDoodleLeft?: string;
  /** Hide left doodle on mobile */
  hideLeftDoodleMobile?: boolean;
  
  /** Show right doodle */
  showRightDoodle?: boolean;
  /** Right doodle image */
  rightDoodleSrc?: string;
  /** Right doodle width */
  rightDoodleWidth?: number;
  /** Right doodle top position */
  rightDoodleTop?: string;
  /** Right doodle right position */
  rightDoodleRight?: string;
  /** Hide right doodle on mobile */
  hideRightDoodleMobile?: boolean;
  
  // Floating Icons
  /** Show floating icons */
  showFloatingIcons?: boolean;
  /** Floating icon 1 name */
  floatingIcon1?: string;
  /** Floating icon 1 size */
  floatingIcon1Size?: number;
  /** Floating icon 1 color */
  floatingIcon1Color?: string;
  /** Floating icon 1 top position */
  floatingIcon1Top?: string;
  /** Floating icon 1 left position */
  floatingIcon1Left?: string;
  /** Floating icon 1 animation duration (s) */
  floatingIcon1Duration?: string;
  /** Floating icon 1 animation delay (s) */
  floatingIcon1Delay?: string;
  /** Floating icon 1 rotation */
  floatingIcon1Rotation?: number;
  
  /** Floating icon 2 name */
  floatingIcon2?: string;
  /** Floating icon 2 size */
  floatingIcon2Size?: number;
  /** Floating icon 2 color */
  floatingIcon2Color?: string;
  /** Floating icon 2 top position */
  floatingIcon2Top?: string;
  /** Floating icon 2 left position */
  floatingIcon2Left?: string;
  /** Floating icon 2 animation duration (s) */
  floatingIcon2Duration?: string;
  /** Floating icon 2 animation delay (s) */
  floatingIcon2Delay?: string;
  /** Floating icon 2 rotation */
  floatingIcon2Rotation?: number;
  
  /** Floating icon 3 name */
  floatingIcon3?: string;
  /** Floating icon 3 size */
  floatingIcon3Size?: number;
  /** Floating icon 3 color */
  floatingIcon3Color?: string;
  /** Floating icon 3 top position */
  floatingIcon3Top?: string;
  /** Floating icon 3 left position */
  floatingIcon3Left?: string;
  /** Floating icon 3 animation duration (s) */
  floatingIcon3Duration?: string;
  /** Floating icon 3 animation delay (s) */
  floatingIcon3Delay?: string;
  /** Floating icon 3 rotation */
  floatingIcon3Rotation?: number;
  
  /** Floating icon 4 name */
  floatingIcon4?: string;
  /** Floating icon 4 size */
  floatingIcon4Size?: number;
  /** Floating icon 4 color */
  floatingIcon4Color?: string;
  /** Floating icon 4 top position */
  floatingIcon4Top?: string;
  /** Floating icon 4 left position */
  floatingIcon4Left?: string;
  /** Floating icon 4 animation duration (s) */
  floatingIcon4Duration?: string;
  /** Floating icon 4 animation delay (s) */
  floatingIcon4Delay?: string;
  /** Floating icon 4 rotation */
  floatingIcon4Rotation?: number;
  
  /** Hide floating icons on mobile */
  hideFloatingIconsMobile?: boolean;
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
  // Logo
  logoSrc = "/next.svg",
  logoWidth = 120,
  logoHeight = 120,
  logoBgColor = "white",
  logoBorderColor = "#D4A574",
  // Text
  title = "UNDRSTATEMNT CO.",
  titleSize = "3rem",
  titleColor = "#1a1a1a",
  subtitle = "1309 Edmonton Trl, Calgary, AB T2E 4Y8",
  subtitleColor = "#666666",
  // Button
  buttonText = "Make a Booking",
  buttonHref = "/booking",
  buttonIcon = "scissors",
  buttonBgColor = "#D97639",
  buttonTextColor = "white",
  buttonHoverColor = "#C06020",
  // Container
  containerBgColor = "rgba(255, 255, 255, 0.8)",
  containerBorderColor = "rgba(255, 255, 255, 0.3)",
  shadowColor = "rgba(0, 0, 0, 0.15)",
  shadowBlur = 40,
  shadowSpread = 8,
  // Left Doodle
  showLeftDoodle = false,
  leftDoodleSrc = "/doodle-left.png",
  leftDoodleWidth = 200,
  leftDoodleTop = "10%",
  leftDoodleLeft = "5%",
  hideLeftDoodleMobile = true,
  // Right Doodle
  showRightDoodle = true,
  rightDoodleSrc = "/doodle-right.png",
  rightDoodleWidth = 200,
  rightDoodleTop = "10%",
  rightDoodleRight = "5%",
  hideRightDoodleMobile = true,
  // Floating Icons
  showFloatingIcons = true,
  floatingIcon1 = "scissors",
  floatingIcon1Size = 40,
  floatingIcon1Color = "#D97639",
  floatingIcon1Top = "15%",
  floatingIcon1Left = "10%",
  floatingIcon1Duration = "3s",
  floatingIcon1Delay = "0s",
  floatingIcon1Rotation = 15,
  
  floatingIcon2 = "star",
  floatingIcon2Size = 30,
  floatingIcon2Color = "#F59E0B",
  floatingIcon2Top = "20%",
  floatingIcon2Left = "85%",
  floatingIcon2Duration = "4s",
  floatingIcon2Delay = "0.5s",
  floatingIcon2Rotation = -20,
  
  floatingIcon3 = "sparkles",
  floatingIcon3Size = 35,
  floatingIcon3Color = "#8B5CF6",
  floatingIcon3Top = "70%",
  floatingIcon3Left = "15%",
  floatingIcon3Duration = "3.5s",
  floatingIcon3Delay = "1s",
  floatingIcon3Rotation = 25,
  
  floatingIcon4 = "heart",
  floatingIcon4Size = 28,
  floatingIcon4Color = "#EC4899",
  floatingIcon4Top = "75%",
  floatingIcon4Left = "80%",
  floatingIcon4Duration = "4.5s",
  floatingIcon4Delay = "1.5s",
  floatingIcon4Rotation = -15,
  
  hideFloatingIconsMobile = true,
}: HeroSectionProps) {
  const ButtonIcon = getIcon(buttonIcon);
  
  // Get floating icon components
  const FloatingIcon1 = getIcon(floatingIcon1);
  const FloatingIcon2 = getIcon(floatingIcon2);
  const FloatingIcon3 = getIcon(floatingIcon3);
  const FloatingIcon4 = getIcon(floatingIcon4);

  return (
    <section
      className={cn("w-full relative overflow-hidden", className)}
      style={style}
    >
      {/* Left Doodle Image */}
      {showLeftDoodle && leftDoodleSrc && (
        <div
          className={cn(
            "absolute pointer-events-none",
            hideLeftDoodleMobile && "hidden md:block"
          )}
          style={{
            top: leftDoodleTop,
            left: leftDoodleLeft,
            width: `${leftDoodleWidth}px`,
            opacity: 0.9,
            zIndex: 1001,
          }}
        >
          <Image
            src={leftDoodleSrc}
            alt="Decorative doodle"
            width={leftDoodleWidth}
            height={leftDoodleWidth}
            className="w-full h-auto"
            unoptimized={leftDoodleSrc.startsWith('http') || leftDoodleSrc.startsWith('data:')}
          />
        </div>
      )}
      
      {/* Right Doodle Image */}
      {showRightDoodle && rightDoodleSrc && (
        <div
          className={cn(
            "absolute pointer-events-none",
            hideRightDoodleMobile && "hidden md:block"
          )}
          style={{
            top: rightDoodleTop,
            right: rightDoodleRight,
            width: `${rightDoodleWidth}px`,
            opacity: 0.9,
            zIndex: 1001,
          }}
        >
          <Image
            src={rightDoodleSrc}
            alt="Decorative doodle"
            width={rightDoodleWidth}
            height={rightDoodleWidth}
            className="w-full h-auto"
            unoptimized={rightDoodleSrc.startsWith('http') || rightDoodleSrc.startsWith('data:')}
          />
        </div>
      )}
      
      {/* Floating Icons */}
      {showFloatingIcons && (
        <div className={cn("absolute inset-0 pointer-events-none", hideFloatingIconsMobile && "hidden md:block")} style={{ zIndex: 1001 }}>
          {/* Floating Icon 1 */}
          <div
            className="absolute animate-float"
            style={{
              top: floatingIcon1Top,
              left: floatingIcon1Left,
              animationDuration: floatingIcon1Duration,
              animationDelay: floatingIcon1Delay,
              transform: `rotate(${floatingIcon1Rotation}deg)`,
            }}
          >
            <FloatingIcon1 
              size={floatingIcon1Size} 
              style={{ color: floatingIcon1Color }}
              className="drop-shadow-lg"
            />
          </div>
          
          {/* Floating Icon 2 */}
          <div
            className="absolute animate-float"
            style={{
              top: floatingIcon2Top,
              left: floatingIcon2Left,
              animationDuration: floatingIcon2Duration,
              animationDelay: floatingIcon2Delay,
              transform: `rotate(${floatingIcon2Rotation}deg)`,
            }}
          >
            <FloatingIcon2 
              size={floatingIcon2Size} 
              style={{ color: floatingIcon2Color }}
              className="drop-shadow-lg"
            />
          </div>
          
          {/* Floating Icon 3 */}
          <div
            className="absolute animate-float"
            style={{
              top: floatingIcon3Top,
              left: floatingIcon3Left,
              animationDuration: floatingIcon3Duration,
              animationDelay: floatingIcon3Delay,
              transform: `rotate(${floatingIcon3Rotation}deg)`,
            }}
          >
            <FloatingIcon3 
              size={floatingIcon3Size} 
              style={{ color: floatingIcon3Color }}
              className="drop-shadow-lg"
            />
          </div>
          
          {/* Floating Icon 4 */}
          <div
            className="absolute animate-float"
            style={{
              top: floatingIcon4Top,
              left: floatingIcon4Left,
              animationDuration: floatingIcon4Duration,
              animationDelay: floatingIcon4Delay,
              transform: `rotate(${floatingIcon4Rotation}deg)`,
            }}
          >
            <FloatingIcon4 
              size={floatingIcon4Size} 
              style={{ color: floatingIcon4Color }}
              className="drop-shadow-lg"
            />
          </div>
        </div>
      )}
      
      {/* Glassy Container with rounded corners */}
      <div 
        className="relative w-full rounded-2xl p-6 md:p-10 lg:p-12"
        style={{
          zIndex: 1000,
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
      
      {/* Floating Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-20px) rotate(var(--rotation, 0deg));
          }
        }
        
        :global(.animate-float) {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

