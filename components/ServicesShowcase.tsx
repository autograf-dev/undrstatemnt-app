"use client";

import { CSSProperties, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  image_url?: string;
  department_name?: string;
}

interface ServiceGroup {
  name: string;
  services: Service[];
}

export interface ServicesShowcaseProps {
  className?: string;
  style?: CSSProperties;
  /** Section title */
  title?: string;
  /** Title color */
  titleColor?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Show search bar */
  showSearch?: boolean;
  /** Show filter button */
  showFilter?: boolean;
  /** Card background color */
  cardBgColor?: string;
  /** Card hover color */
  cardHoverColor?: string;
  /** Price badge color */
  priceBadgeColor?: string;
  /** Price text color */
  priceTextColor?: string;
  /** See all button color */
  seeAllBgColor?: string;
  /** See all text color */
  seeAllTextColor?: string;
  /** Background color */
  bgColor?: string;
  /** Section padding */
  padding?: string;
  /** Card image height */
  cardImageHeight?: string;
}

export default function ServicesShowcase({
  className,
  style,
  title = "Our Services",
  titleColor = "#1a1a1a",
  searchPlaceholder = "Search",
  showSearch = true,
  showFilter = true,
  cardBgColor = "white",
  cardHoverColor = "#f9fafb",
  priceBadgeColor = "#f3f4f6",
  priceTextColor = "#1f2937",
  seeAllBgColor = "#D97639",
  seeAllTextColor = "white",
  bgColor = "white",
  padding = "3rem 2rem",
  cardImageHeight = "200px",
}: ServicesShowcaseProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();

        // Coerce to an array of raw service/calendar entries
        const raw: any[] = Array.isArray(data?.services)
          ? data.services
          : (Array.isArray(data?.calendars) ? data.calendars : (Array.isArray(data) ? data : []));

        const mapped: Service[] = raw.map((s: any) => {
          // Derive duration in minutes
          const rawDur = Number(s?.slotDuration ?? s?.duration ?? 0);
          const unit = String(s?.slotDurationUnit ?? s?.durationUnit ?? '').toLowerCase();
          const duration = rawDur > 0 ? (unit === 'hour' || unit === 'hours' ? rawDur * 60 : rawDur) : 0;

          // Derive price if present
          const priceCandidates = ["price", "fromPrice", "minPrice", "startingPrice", "startPrice", "amount"];
          let price = 0;
          for (const k of priceCandidates) {
            const v = Number(s?.[k]);
            if (!Number.isNaN(v) && v > 0) { price = v; break; }
          }

          // Derive department/group name
          const groupNameKeys = [
            "category", "categoryName", "group", "groupName", "department", "departmentName", "folder", "folderName", "calendarGroup"
          ];
          let department_name = "Other Services";
          for (const k of groupNameKeys) {
            const val = s?.[k];
            if (typeof val === "string" && val.trim()) { department_name = String(val).trim(); break; }
          }

          // Derive image url if present
          const imageKeys = ["image", "imageUrl", "photo", "cover", "thumbnail", "thumbUrl"];
          let image_url: string | undefined = undefined;
          for (const k of imageKeys) {
            const val = s?.[k];
            if (typeof val === 'string' && val) { image_url = val; break; }
          }

        return {
            id: String(s?.id ?? ''),
            name: String(s?.name ?? 'Service'),
            description: s?.description,
            duration,
            price,
            image_url,
            department_name,
          } as Service;
        });

        setServices(mapped);
        setFilteredServices(mapped);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
        setFilteredServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.department_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchQuery, services]);

  // Group services by department
  const groupedServices = (Array.isArray(filteredServices) ? filteredServices : []).reduce((acc, service) => {
    const dept = service.department_name || "Other Services";
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const serviceGroups: ServiceGroup[] = Object.entries(groupedServices).map(([name, services]) => ({
    name,
    services,
  }));

  const clearSearch = () => {
    setSearchQuery("");
  };

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
        {/* Header with Title */}
        <div className="mb-8">
          <h2
            className="text-4xl font-bold mb-6"
            style={{ color: titleColor }}
          >
            {title}
          </h2>

          {/* Search and Filter Bar */}
          {(showSearch || showFilter) && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search Input */}
              {showSearch && (
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Filter Button */}
              {showFilter && (
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">Filter</span>
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                    0
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        )}

        {/* Service Groups */}
        {!loading && serviceGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No services found</p>
          </div>
        )}

        {!loading && (Array.isArray(serviceGroups) ? serviceGroups : []).map((group) => (
          <div key={group.name} className="mb-12">
            {/* Group Header with See All */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold" style={{ color: titleColor }}>
                {group.name}
              </h3>
              <Link
                href={`/services?group=${encodeURIComponent(group.name)}`}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md"
                style={{
                  backgroundColor: seeAllBgColor,
                  color: seeAllTextColor,
                }}
              >
                <span>See All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Horizontal Scrolling Cards */}
            <div className="overflow-x-auto pb-4 -mx-2 px-2">
              <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                {group.services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/booking?serviceId=${service.id}`}
                    className="flex-none w-[320px] rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
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
                    {/* Service Image */}
                    {service.image_url && (
                      <div
                        className="relative w-full overflow-hidden bg-gray-200"
                        style={{ height: cardImageHeight }}
                      >
                        <Image
                          src={service.image_url}
                          alt={service.name}
                          fill
                          className="object-cover"
                          unoptimized={service.image_url.startsWith('http')}
                        />
                      </div>
                    )}

                    {/* Service Info */}
                    <div className="p-5">
                      {/* Price Badge */}
                      <div
                        className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3"
                        style={{
                          backgroundColor: priceBadgeColor,
                          color: priceTextColor,
                        }}
                      >
                        From ${service.price.toFixed(2)}
                      </div>

                      {/* Service Name */}
                      <h4 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: titleColor }}>
                        {service.name}
                      </h4>

                      {/* Duration */}
                      <p className="text-sm text-gray-600">
                        {Math.floor(service.duration / 60)} hrs {service.duration % 60} mins +
                      </p>

                      {/* Description if available */}
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

