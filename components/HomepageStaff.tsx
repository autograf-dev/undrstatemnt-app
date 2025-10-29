"use client";

import { CSSProperties, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Staff {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  image_link?: string;
  ghl_id?: string;
  acuity_id?: string;
}

export interface HomepageStaffProps {
  className?: string;
  style?: CSSProperties;
  
  // API Configuration
  /** API endpoint to fetch staff data */
  apiPath?: string;
  
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
  
  // See All Link Controls
  /** Show "See All" link */
  showSeeAll?: boolean;
  /** See All link href */
  seeAllHref?: string;
  /** See All color */
  seeAllColor?: string;
  /** See All font size - Mobile */
  seeAllSizeMobile?: string;
  /** See All font size - Tablet */
  seeAllSizeTablet?: string;
  /** See All font size - Desktop */
  seeAllSizeDesktop?: string;
  
  // Card Appearance
  /** Card background color */
  cardBgColor?: string;
  /** Card hover color */
  cardHoverColor?: string;
  /** Card width - Mobile */
  cardWidthMobile?: number;
  /** Card width - Tablet */
  cardWidthTablet?: number;
  /** Card width - Desktop */
  cardWidthDesktop?: number;
  /** Card image height - Mobile */
  cardImageHeightMobile?: number;
  /** Card image height - Tablet */
  cardImageHeightTablet?: number;
  /** Card image height - Desktop */
  cardImageHeightDesktop?: number;
  /** Staff name color */
  nameColor?: string;
  /** Staff name font size */
  nameFontSize?: string;
  /** Staff subtitle color */
  subtitleColor?: string;
  /** Staff subtitle font size */
  subtitleFontSize?: string;
  
  // Section Style
  /** Background color */
  bgColor?: string;
  /** Section padding - Mobile */
  paddingMobile?: string;
  /** Section padding - Tablet */
  paddingTablet?: string;
  /** Section padding - Desktop */
  paddingDesktop?: string;
  
  // Carousel Controls
  /** Cards per view - Mobile */
  cardsPerViewMobile?: number;
  /** Cards per view - Tablet */
  cardsPerViewTablet?: number;
  /** Cards per view - Desktop */
  cardsPerViewDesktop?: number;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Arrow color */
  arrowColor?: string;
  /** Arrow background */
  arrowBgColor?: string;
  /** Show scroll dots */
  showScrollDots?: boolean;
}

export default function HomepageStaff({
  className,
  style,
  apiPath = "/api/supabasestaff",
  title = "Our Professionals",
  titleColor = "#1a1a1a",
  titleSizeMobile = "1.5rem",
  titleSizeTablet = "1.875rem",
  titleSizeDesktop = "2.25rem",
  showSeeAll = true,
  seeAllHref = "/staff",
  seeAllColor = "#D97639",
  seeAllSizeMobile = "0.875rem",
  seeAllSizeTablet = "1rem",
  seeAllSizeDesktop = "1.125rem",
  cardBgColor = "white",
  cardHoverColor = "#f9fafb",
  cardWidthMobile = 280,
  cardWidthTablet = 300,
  cardWidthDesktop = 320,
  cardImageHeightMobile = 250,
  cardImageHeightTablet = 280,
  cardImageHeightDesktop = 300,
  nameColor = "#1a1a1a",
  nameFontSize = "1.25rem",
  subtitleColor = "#6b7280",
  subtitleFontSize = "0.875rem",
  bgColor = "#f9fafb",
  paddingMobile = "2rem 1rem",
  paddingTablet = "2.5rem 1.5rem",
  paddingDesktop = "3rem 2rem",
  cardsPerViewMobile = 1,
  cardsPerViewTablet = 2,
  cardsPerViewDesktop = 4,
  showArrows = true,
  arrowColor = "#D97639",
  arrowBgColor = "white",
  showScrollDots = true,
}: HomepageStaffProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current cards per view based on screen size
  const getCurrentCardsPerView = () => {
    if (windowWidth < 768) return cardsPerViewMobile;
    if (windowWidth < 1024) return cardsPerViewTablet;
    return cardsPerViewDesktop;
  };

  const currentCardsPerView = getCurrentCardsPerView();

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

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.scrollWidth / staff.length;
      scrollContainerRef.current.scrollTo({
        left: cardWidth * index,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - currentCardsPerView);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, staff.length - currentCardsPerView);
    const newIndex = Math.min(maxIndex, currentIndex + currentCardsPerView);
    scrollToIndex(newIndex);
  };

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < staff.length - currentCardsPerView;

  return (
    <section
      className={cn("w-full relative", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
      }}
    >
      <div className="max-w-7xl mx-auto" style={{
        padding: windowWidth < 768 ? paddingMobile : windowWidth < 1024 ? paddingTablet : paddingDesktop
      }}>
        {/* Header - Fully Responsive */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <h2
            className="font-bold"
            style={{ 
              color: titleColor,
              fontSize: windowWidth < 768 ? titleSizeMobile : windowWidth < 1024 ? titleSizeTablet : titleSizeDesktop
            }}
          >
            {title}
          </h2>
          {showSeeAll && (
            <Link
              href={seeAllHref}
              className="font-semibold flex items-center gap-2 hover:underline whitespace-nowrap"
              style={{ 
                color: seeAllColor,
                fontSize: windowWidth < 768 ? seeAllSizeMobile : windowWidth < 1024 ? seeAllSizeTablet : seeAllSizeDesktop
              }}
            >
              See All
              <ChevronRight style={{ 
                width: windowWidth < 768 ? '16px' : '20px',
                height: windowWidth < 768 ? '16px' : '20px'
              }} />
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading staff...</p>
          </div>
        )}

        {/* Staff Carousel */}
        {!loading && (
          <div className="relative">
            {/* Navigation Arrows - Hidden on Mobile */}
            {showArrows && canScrollLeft && (
              <button
                onClick={handlePrevious}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: arrowBgColor,
                  color: arrowColor,
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {showArrows && canScrollRight && (
              <button
                onClick={handleNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: arrowBgColor,
                  color: arrowColor,
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Scrollable Container - Mobile Responsive */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide -mx-2 px-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div
                className="flex gap-4 md:gap-6"
                style={{
                  minWidth: "min-content",
                }}
              >
                {staff.map((member) => {
                  const cardWidth = windowWidth < 768 ? cardWidthMobile : windowWidth < 1024 ? cardWidthTablet : cardWidthDesktop;
                  const imageHeight = windowWidth < 768 ? cardImageHeightMobile : windowWidth < 1024 ? cardImageHeightTablet : cardImageHeightDesktop;
                  
                  return (
                    <Link
                      key={member.id}
                      href={`/booking?staffId=${member.ghl_id || member.id}`}
                      className="flex-none rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 snap-center"
                      style={{
                        width: `${cardWidth}px`,
                        backgroundColor: cardBgColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = cardHoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = cardBgColor;
                      }}
                    >
                      {/* Staff Image - Fully Responsive */}
                      <div
                        className="relative w-full overflow-hidden bg-gray-200"
                        style={{ height: `${imageHeight}px` }}
                      >
                        {member.image_link ? (
                          <Image
                            src={member.image_link}
                            alt={member.name}
                            fill
                            className="object-cover"
                            unoptimized={member.image_link.startsWith('http')}
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center font-bold"
                            style={{ 
                              color: titleColor, 
                              backgroundColor: "#e5e7eb",
                              fontSize: `${imageHeight / 5}px`
                            }}
                          >
                            {member.firstname.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Staff Info - Fully Responsive */}
                      <div className="p-4 sm:p-5 text-center">
                        <h4
                          className="font-bold mb-1"
                          style={{ 
                            color: nameColor,
                            fontSize: nameFontSize
                          }}
                        >
                          {member.name}
                        </h4>
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
            </div>

            {/* Scroll Indicator Dots - Responsive */}
            {showScrollDots && (
              <div className="flex justify-center gap-2 mt-4 sm:mt-6">
                {Array.from({ length: Math.ceil(staff.length / currentCardsPerView) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToIndex(idx * currentCardsPerView)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: Math.floor(currentIndex / currentCardsPerView) === idx ? arrowColor : "#d1d5db",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

