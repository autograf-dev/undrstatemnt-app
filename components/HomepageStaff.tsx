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
  /** Section title */
  title?: string;
  /** Title color */
  titleColor?: string;
  /** Show "See All" link */
  showSeeAll?: boolean;
  /** See All link href */
  seeAllHref?: string;
  /** See All color */
  seeAllColor?: string;
  /** Card background color */
  cardBgColor?: string;
  /** Card hover color */
  cardHoverColor?: string;
  /** Staff name color */
  nameColor?: string;
  /** Staff subtitle color */
  subtitleColor?: string;
  /** Background color */
  bgColor?: string;
  /** Section padding */
  padding?: string;
  /** Card image height */
  cardImageHeight?: string;
  /** Cards per view (desktop) */
  cardsPerView?: number;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Arrow color */
  arrowColor?: string;
  /** Arrow background */
  arrowBgColor?: string;
}

export default function HomepageStaff({
  className,
  style,
  title = "Our Professionals",
  titleColor = "#1a1a1a",
  showSeeAll = true,
  seeAllHref = "/staff",
  seeAllColor = "#D97639",
  cardBgColor = "white",
  cardHoverColor = "#f9fafb",
  nameColor = "#1a1a1a",
  subtitleColor = "#6b7280",
  bgColor = "#f9fafb",
  padding = "3rem 2rem",
  cardImageHeight = "300px",
  cardsPerView = 4,
  showArrows = true,
  arrowColor = "#D97639",
  arrowBgColor = "white",
}: HomepageStaffProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch("/api/staff");
        const data = await res.json();
        setStaff(data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

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
    const newIndex = Math.max(0, currentIndex - cardsPerView);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, staff.length - cardsPerView);
    const newIndex = Math.min(maxIndex, currentIndex + cardsPerView);
    scrollToIndex(newIndex);
  };

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < staff.length - cardsPerView;

  return (
    <section
      className={cn("w-full relative", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
        padding,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-4xl font-bold"
            style={{ color: titleColor }}
          >
            {title}
          </h2>
          {showSeeAll && (
            <Link
              href={seeAllHref}
              className="text-lg font-semibold flex items-center gap-2 hover:underline"
              style={{ color: seeAllColor }}
            >
              See All
              <ChevronRight className="w-5 h-5" />
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
            {/* Navigation Arrows */}
            {showArrows && canScrollLeft && (
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-lg transition-all hover:scale-110"
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
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: arrowBgColor,
                  color: arrowColor,
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide -mx-2 px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div
                className="flex gap-6"
                style={{
                  minWidth: "min-content",
                }}
              >
                {staff.map((member) => (
                  <Link
                    key={member.id}
                    href={`/booking?staffId=${member.ghl_id || member.id}`}
                    className="flex-none rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105"
                    style={{
                      width: `calc((100% - ${(cardsPerView - 1) * 1.5}rem) / ${cardsPerView})`,
                      minWidth: "250px",
                      backgroundColor: cardBgColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = cardHoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = cardBgColor;
                    }}
                  >
                    {/* Staff Image */}
                    <div
                      className="relative w-full overflow-hidden bg-gray-200"
                      style={{ height: cardImageHeight }}
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
                          className="w-full h-full flex items-center justify-center text-6xl font-bold"
                          style={{ color: titleColor, backgroundColor: "#e5e7eb" }}
                        >
                          {member.firstname.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Staff Info */}
                    <div className="p-5 text-center">
                      <h4
                        className="text-xl font-bold mb-1"
                        style={{ color: nameColor }}
                      >
                        {member.name}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: subtitleColor }}
                      >
                        {member.firstname} {member.lastname}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Scroll Indicator Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(staff.length / cardsPerView) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx * cardsPerView)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: Math.floor(currentIndex / cardsPerView) === idx ? arrowColor : "#d1d5db",
                  }}
                />
              ))}
            </div>
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

