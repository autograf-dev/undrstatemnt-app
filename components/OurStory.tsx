"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface OurStoryProps {
  className?: string;
  style?: CSSProperties;
  /** Section title */
  title?: string;
  /** Title font size */
  titleSize?: string;
  /** Title color */
  titleColor?: string;
  /** Story content text */
  content?: string;
  /** Content font size */
  contentSize?: string;
  /** Content color */
  contentColor?: string;
  /** Story image */
  imageSrc?: string;
  /** Image width */
  imageWidth?: number;
  /** Image height */
  imageHeight?: number;
  /** Image position (left or right) */
  imagePosition?: "left" | "right";
  /** Background color */
  bgColor?: string;
  /** Container padding */
  padding?: string;
  /** Maximum container width */
  maxWidth?: string;
}

export default function OurStory({
  className,
  style,
  title = "Our Story",
  titleSize = "2.5rem",
  titleColor = "#1a1a1a",
  content = "LOCATED IN DOWNTOWN CALGARY, UNDRSTATEMNT IS A PREMIER BARBERSHOP THAT PROVIDES A HIGH LEVEL OF CARE AND EXPERIENCE TO OUR CLIENTELE. DRIVEN BY OUR PASSION AND EXPERTISE, OUR CLIENTS ARE CONFIDENT THAT THEY CAN COUNT ON OUR PROFESSIONAL SERVICE. THEY KNOW THAT THEY WILL LEAVE OUR SALON FEELING AND LOOKING THEIR BEST. UNDRSTATEMNT'S GOAL IS TO HAVE A SHOP DEEPLY ROOTED IN THE FOUNDATION OF THE COMMUNITY, SOMEWHERE THEIR CLIENTELE CAN SURROUND THEMSELVES WITH AMAZING PEOPLE THROUGH THE YEARS.",
  contentSize = "1rem",
  contentColor = "#6b7280",
  imageSrc = "/Understatement.jpg",
  imageWidth = 600,
  imageHeight = 400,
  imagePosition = "right",
  bgColor = "white",
  padding = "3rem 2rem",
  maxWidth = "1200px",
}: OurStoryProps) {
  const isImageRight = imagePosition === "right";

  return (
    <section
      className={cn("w-full", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
        padding,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth,
        }}
      >
        <div
          className={cn(
            "flex flex-col gap-8 items-center",
            "lg:flex-row lg:gap-12"
          )}
          style={{
            flexDirection: isImageRight ? 'row' : 'row-reverse',
          }}
        >
          {/* Text Content */}
          <div className="flex-1">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: titleSize,
                color: titleColor,
              }}
            >
              {title}
            </h2>
            <p
              className="leading-relaxed"
              style={{
                fontSize: contentSize,
                color: contentColor,
                lineHeight: '1.8',
                letterSpacing: '0.02em',
              }}
            >
              {content}
            </p>
          </div>

          {/* Image */}
          <div className="flex-1 w-full">
            <div
              className="relative w-full rounded-lg overflow-hidden shadow-lg"
              style={{
                height: imageHeight,
              }}
            >
              <Image
                src={imageSrc || "/next.svg"}
                alt={title}
                fill
                className="object-cover"
                unoptimized={imageSrc?.startsWith('http')}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

