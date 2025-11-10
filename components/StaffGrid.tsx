"use client";

import { CSSProperties, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Staff {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  image_link?: string;
  photo?: string;
  ghl_id?: string;
  acuity_id?: string;
}

export interface StaffGridProps {
  className?: string;
  style?: CSSProperties;
  
  // Title Controls
  /** Section title */
  title?: string;
  /** Title color */
  titleColor?: string;
  /** Title font size - Mobile */
  titleSizeMobile?: string;
  /** Title font size - Tablet */
  titleSizeTablet?: string;
  /** Title font size - Desktop */
  titleSizeDesktop?: string;
  
  // Breadcrumb
  /** Breadcrumb text */
  breadcrumb?: string;
  /** Breadcrumb color */
  breadcrumbColor?: string;
  /** Show breadcrumb */
  showBreadcrumb?: boolean;
  /** Breadcrumb font size */
  breadcrumbSize?: string;
  
  // Card Appearance
  /** Card background color */
  cardBgColor?: string;
  /** Card hover color */
  cardHoverColor?: string;
  /** Card image height - Mobile */
  cardImageHeightMobile?: number;
  /** Card image height - Tablet */
  cardImageHeightTablet?: number;
  /** Card image height - Desktop */
  cardImageHeightDesktop?: number;
  /** Card border radius */
  cardBorderRadius?: string;
  
  // Staff Info
  /** Staff name color */
  nameColor?: string;
  /** Staff name font size */
  nameFontSize?: string;
  /** Staff subtitle color */
  subtitleColor?: string;
  /** Staff subtitle font size */
  subtitleFontSize?: string;
  
  // Layout Controls
  /** Columns - Mobile */
  columnsMobile?: number;
  /** Columns - Tablet */
  columnsTablet?: number;
  /** Columns - Desktop */
  columnsDesktop?: number;
  /** Gap between cards */
  cardGap?: string;
  
  // Section Style
  /** Background color */
  bgColor?: string;
  /** Section padding - Mobile */
  paddingMobile?: string;
  /** Section padding - Tablet */
  paddingTablet?: string;
  /** Section padding - Desktop */
  paddingDesktop?: string;
  /** Maximum width */
  maxWidth?: string;
  
  // API Configuration
  /** API endpoint to fetch staff data */
  apiPath?: string;
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function StaffGrid({
  className,
  style,
  // Title
  title = "Our Professionals",
  titleColor = "#1a1a1a",
  titleSizeMobile = "1.5rem",
  titleSizeTablet = "2rem",
  titleSizeDesktop = "2.5rem",
  // Breadcrumb
  breadcrumb = "Home / All",
  breadcrumbColor = "#6b7280",
  showBreadcrumb = true,
  breadcrumbSize = "0.875rem",
  // Card Appearance
  cardBgColor = "white",
  cardHoverColor = "#f9fafb",
  cardImageHeightMobile = 250,
  cardImageHeightTablet = 300,
  cardImageHeightDesktop = 350,
  cardBorderRadius = "0.75rem",
  // Staff Info
  nameColor = "#1a1a1a",
  nameFontSize = "1.25rem",
  subtitleColor = "#6b7280",
  subtitleFontSize = "0.875rem",
  // Layout
  columnsMobile = 2,
  columnsTablet = 3,
  columnsDesktop = 4,
  cardGap = "1.5rem",
  // Section Style
  bgColor = "white",
  paddingMobile = "2rem 1rem",
  paddingTablet = "2.5rem 1.5rem",
  paddingDesktop = "3rem 2rem",
  maxWidth = "1280px",
  // API
  apiPath = "/api/supabasestaff",
}: StaffGridProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to get responsive value based on screen size
  const getResponsiveValue = <T,>(mobile: T, tablet: T, desktop: T): T => {
    if (windowWidth === 0 || windowWidth >= 1024) return desktop;
    if (windowWidth < 768) return mobile;
    return tablet;
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(apiPath);
        const data = await res.json();
        setStaff(data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [apiPath]);

  // Build responsive grid classes
  const gridColsClass = `grid-cols-${columnsMobile} md:grid-cols-${columnsTablet} lg:grid-cols-${columnsDesktop}`;

  return (
    <section
      className={cn("w-full py-8 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
      }}
    >
      <div className="mx-auto" style={{ maxWidth }}>
        {/* Breadcrumb */}
        {showBreadcrumb && (
          <div className="mb-3 sm:mb-4">
            <p
              style={{ 
                color: breadcrumbColor,
                fontSize: breadcrumbSize
              }}
            >
              {breadcrumb}
            </p>
          </div>
        )}

        {/* Title */}
        <h1
          className="font-bold mb-8 sm:mb-10 md:mb-12"
          style={{ 
            color: titleColor,
            fontSize: getResponsiveValue(titleSizeMobile, titleSizeTablet, titleSizeDesktop)
          }}
        >
          {title}
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading staff...</p>
          </div>
        )}

        {/* Staff Grid */}
        {!loading && staff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No staff members found</p>
          </div>
        )}

        {!loading && staff.length > 0 && (
          <div 
            className={cn("grid", gridColsClass)}
            style={{ gap: cardGap }}
          >
            {staff.map((member) => {
              const imageHeight = getResponsiveValue(
                cardImageHeightMobile,
                cardImageHeightTablet,
                cardImageHeightDesktop
              );
              
              // Extract only the first word (before any hyphen or space)
              const firstNameOnly = (member.firstname || member.name || '').split(/[\s-]+/)[0];
              const slug = generateSlug(firstNameOnly);
              const href = `/${slug}`;
              
              return (
                <Link
                  key={member.id}
                  href={href}
                  className="text-left w-full group overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 block"
                  style={{
                    backgroundColor: cardBgColor,
                    borderRadius: cardBorderRadius,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = cardHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = cardBgColor;
                  }}
                >
                  {/* Staff Image */}
                  <div
                    className="relative w-full overflow-hidden bg-gray-200"
                    style={{ height: `${imageHeight}px` }}
                  >
                    {member.photo || member.image_link ? (
                      <Image
                        src={member.photo || member.image_link || ''}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        unoptimized={Boolean((member.photo || member.image_link) && (member.photo || member.image_link)!.startsWith('http'))}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-bold"
                        style={{ 
                          color: titleColor, 
                          backgroundColor: "#e5e7eb",
                          fontSize: `${imageHeight / 4}px`
                        }}
                      >
                        {(member.firstname ?? "").charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Staff Info */}
                  <div className="p-4 sm:p-5 text-center">
                    <h3
                      className="font-bold mb-1"
                      style={{ 
                        color: nameColor,
                        fontSize: nameFontSize
                      }}
                    >
                      {member.name}
                    </h3>
                    <p
                      style={{ 
                        color: subtitleColor,
                        fontSize: subtitleFontSize
                      }}
                    >
                      {member.firstname} {member.lastname}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

