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
  ghl_id?: string;
  acuity_id?: string;
}

export interface StaffShowcaseProps {
  className?: string;
  style?: CSSProperties;
  /** Section title */
  title?: string;
  /** Title color */
  titleColor?: string;
  /** Breadcrumb text */
  breadcrumb?: string;
  /** Breadcrumb color */
  breadcrumbColor?: string;
  /** Show breadcrumb */
  showBreadcrumb?: boolean;
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
  /** Columns (desktop) */
  columns?: number;
}

export default function StaffShowcase({
  className,
  style,
  title = "Our Professionals",
  titleColor = "#1a1a1a",
  breadcrumb = "Home / All",
  breadcrumbColor = "#6b7280",
  showBreadcrumb = true,
  cardBgColor = "white",
  cardHoverColor = "#f9fafb",
  nameColor = "#1a1a1a",
  subtitleColor = "#6b7280",
  bgColor = "white",
  padding = "3rem 2rem",
  cardImageHeight = "350px",
  columns = 4,
}: StaffShowcaseProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch("/api/supabasestaff");
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

  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  return (
    <section
      className={cn("w-full", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
        padding,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        {showBreadcrumb && (
          <div className="mb-4">
            <p
              className="text-sm"
              style={{ color: breadcrumbColor }}
            >
              {breadcrumb}
            </p>
          </div>
        )}

        {/* Title */}
        <h1
          className="text-4xl font-bold mb-12"
          style={{ color: titleColor }}
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
          <div className={cn("grid gap-6", gridCols)}>
            {staff.map((member) => (
              <Link
                key={member.id}
                href={`/booking?staffId=${member.ghl_id || member.id}`}
                className="group rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{
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
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
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
                  <h3
                    className="text-xl font-bold mb-1"
                    style={{ color: nameColor }}
                  >
                    {member.name}
                  </h3>
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
        )}
      </div>
    </section>
  );
}

