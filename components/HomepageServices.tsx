"use client";

import { CSSProperties, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDrawerControl } from "./PageShellWithHeader";
import { useBooking } from "@/contexts/BookingContext";

interface Service {
  id: string;
  name: string;
  displayName: string;
  duration: string;
  durationDisplay: string;
  price: string;
  displayPrice: string;
  photo?: string;
  category: string;
  categoryList?: string;
  available?: string;
  barberIds?: string;
  customPriceList?: string;
  customPrice?: string;
}

export interface HomepageServicesProps {
  className?: string;
  style?: CSSProperties;
  
  // API Configuration
  /** API endpoint to fetch services data */
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
  
  // Search & Filter
  /** Show search bar */
  showSearch?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Show filter button */
  showFilter?: boolean;
  /** Filter button text */
  filterButtonText?: string;
  /** Search/Filter background */
  searchBgColor?: string;
  /** Search/Filter text color */
  searchTextColor?: string;
  /** Search/Filter border color */
  searchBorderColor?: string;
  
  // Category Display
  /** Group services by category */
  groupByCategory?: boolean;
  /** Show category titles */
  showCategoryTitles?: boolean;
  /** Category title color */
  categoryTitleColor?: string;
  /** Category title font size */
  categoryTitleSize?: string;
  /** Show "See All/View Less" button */
  showSeeAll?: boolean;
  /** See All button color */
  seeAllColor?: string;
  /** See All font size - Mobile */
  seeAllSizeMobile?: string;
  /** See All font size - Tablet */
  seeAllSizeTablet?: string;
  /** See All font size - Desktop */
  seeAllSizeDesktop?: string;
  /** Initial items to show when collapsed */
  initialItemsToShow?: number;
  /** View Less button text */
  viewLessText?: string;
  /** See All button text */
  seeAllText?: string;
  
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
  /** Service name color */
  nameColor?: string;
  /** Service name font size */
  nameFontSize?: string;
  /** Price color */
  priceColor?: string;
  /** Price font size */
  priceFontSize?: string;
  /** Duration color */
  durationColor?: string;
  /** Duration font size */
  durationFontSize?: string;
  /** Show service duration */
  showDuration?: boolean;
  
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
  /** Show arrows on mobile */
  showArrowsMobile?: boolean;
  /** Arrow color */
  arrowColor?: string;
  /** Arrow background */
  arrowBgColor?: string;
  /** Show scroll dots */
  showScrollDots?: boolean;
  /** Scroll dots color */
  scrollDotsColor?: string;
  
  // Card Click Behavior
  /** Card link template (use {id} for service ID) */
  cardLinkTemplate?: string;
}

export default function HomepageServices({
  // Add a prop to control drawer behavior
  useDrawerForBooking = false,
  className,
  style,
  apiPath = "/api/supabaseservices",
  title = "Our Services",
  titleColor = "#1a1a1a",
  titleSizeMobile = "1.5rem",
  titleSizeTablet = "1.875rem",
  titleSizeDesktop = "2.25rem",
  showSearch = true,
  searchPlaceholder = "Search",
  showFilter = true,
  filterButtonText = "Filter",
  searchBgColor = "#f3f4f6",
  searchTextColor = "#6b7280",
  searchBorderColor = "#e5e7eb",
  groupByCategory = true,
  showCategoryTitles = true,
  categoryTitleColor = "#1a1a1a",
  categoryTitleSize = "1.5rem",
  showSeeAll = true,
  seeAllColor = "#D97639",
  seeAllSizeMobile = "0.875rem",
  seeAllSizeTablet = "1rem",
  seeAllSizeDesktop = "1.125rem",
  initialItemsToShow = 4,
  viewLessText = "View Less",
  seeAllText = "See All",
  cardBgColor = "white",
  cardHoverColor = "#f9fafb",
  cardWidthMobile = 280,
  cardWidthTablet = 300,
  cardWidthDesktop = 320,
  cardImageHeightMobile = 200,
  cardImageHeightTablet = 220,
  cardImageHeightDesktop = 240,
  nameColor = "#1a1a1a",
  nameFontSize = "1rem",
  priceColor = "#D97639",
  priceFontSize = "0.875rem",
  durationColor = "#6b7280",
  durationFontSize = "0.875rem",
  showDuration = true,
  bgColor = "white",
  paddingMobile = "2rem 1rem",
  paddingTablet = "2.5rem 1.5rem",
  paddingDesktop = "3rem 2rem",
  cardsPerViewMobile = 1,
  cardsPerViewTablet = 2,
  cardsPerViewDesktop = 4,
  showArrows = true,
  showArrowsMobile = false,
  arrowColor = "#D97639",
  arrowBgColor = "white",
  showScrollDots = true,
  scrollDotsColor = "#D97639",
  cardLinkTemplate = "/booking?serviceId={id}",
}: HomepageServicesProps & { useDrawerForBooking?: boolean }) {
  // Try to get drawer control - will be undefined if not in PageShellWithHeader
  let drawerControl;
  let bookingContext;
  try {
    drawerControl = useDrawerForBooking ? useDrawerControl() : null;
    bookingContext = useDrawerForBooking ? useBooking() : null;
  } catch {
    drawerControl = null;
    bookingContext = null;
  }
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryScrollPositions, setCategoryScrollPositions] = useState<{[key: string]: number}>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to get responsive value based on screen size
  const getResponsiveValue = <T,>(mobile: T, tablet: T, desktop: T): T => {
    // Default to desktop if window width is 0 (SSR) or > 1024
    if (windowWidth === 0 || windowWidth >= 1024) return desktop;
    if (windowWidth < 768) return mobile;
    return tablet;
  };

  // Get current cards per view based on screen size
  const getCurrentCardsPerView = () => {
    return getResponsiveValue(cardsPerViewMobile, cardsPerViewTablet, cardsPerViewDesktop);
  };

  const currentCardsPerView = getCurrentCardsPerView();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(apiPath);
        const data = await res.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setServices(data);
        } else {
          console.error("API response is not an array:", data);
          setServices([]);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [apiPath]);

  // Get unique categories - ensure services is always an array
  const categories = Array.isArray(services) 
    ? Array.from(new Set(services.map(s => s.category).filter(Boolean)))
    : [];

  // Filter services - ensure services is an array
  const filteredServices = Array.isArray(services) 
    ? services.filter(service => {
        const matchesSearch = !searchQuery || 
          service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.category?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategories.length === 0 || 
          selectedCategories.some(cat => service.category?.includes(cat));
        
        return matchesSearch && matchesCategory;
      })
    : [];

  // Group services by category
  const groupedServices: {[key: string]: Service[]} = {};
  if (groupByCategory) {
    filteredServices.forEach(service => {
      const cat = service.category || "Other";
      if (!groupedServices[cat]) {
        groupedServices[cat] = [];
      }
      groupedServices[cat].push(service);
    });
  } else {
    groupedServices["All Services"] = filteredServices;
  }

  const handleScroll = (category: string, direction: 'left' | 'right', containerRef: HTMLDivElement) => {
    const cardWidth = getResponsiveValue(cardWidthMobile, cardWidthTablet, cardWidthDesktop);
    const scrollAmount = (cardWidth + 24) * currentCardsPerView; // 24 is gap
    
    const currentScroll = categoryScrollPositions[category] || 0;
    const newScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;
    
    containerRef.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
    
    setCategoryScrollPositions(prev => ({
      ...prev,
      [category]: newScroll
    }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <section
      className={cn("w-full relative", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
      }}
    >
      <div className="max-w-7xl mx-auto" style={{
        padding: getResponsiveValue(paddingMobile, paddingTablet, paddingDesktop)
      }}>
        {/* Header with Search & Filter */}
        <div className="mb-6 sm:mb-8">
          {/* Title */}
          <h2
            className="font-bold mb-4 sm:mb-6"
            style={{ 
              color: titleColor,
              fontSize: getResponsiveValue(titleSizeMobile, titleSizeTablet, titleSizeDesktop)
            }}
          >
            {title}
          </h2>

          {/* Search & Filter Bar */}
          {(showSearch || showFilter) && (
            <div className="flex gap-3">
              {showSearch && (
                <div className="flex-1 relative">
                  <Search 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: searchTextColor }}
                  />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{
                      backgroundColor: searchBgColor,
                      color: searchTextColor,
                      border: `1px solid ${searchBorderColor}`,
                    }}
                  />
                </div>
              )}
              
              {showFilter && (
                <button
                  onClick={() => setShowFilterModal(!showFilterModal)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all hover:opacity-80"
                  style={{
                    backgroundColor: searchBgColor,
                    color: searchTextColor,
                    border: `1px solid ${searchBorderColor}`,
                  }}
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">{filterButtonText}</span>
                  {selectedCategories.length > 0 && (
                    <span 
                      className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: arrowColor,
                        color: "white"
                      }}
                    >
                      {selectedCategories.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Filter Modal */}
          {showFilterModal && (
            <div className="absolute right-4 sm:right-8 mt-2 rounded-xl shadow-2xl z-50 border"
              style={{
                backgroundColor: cardBgColor,
                borderColor: searchBorderColor,
                width: (windowWidth === 0 || windowWidth >= 640) ? "300px" : "calc(100% - 2rem)",
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: titleColor }}>Category</h3>
                  <button onClick={() => setShowFilterModal(false)}>
                    <X className="w-5 h-5" style={{ color: searchTextColor }} />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: arrowColor }}
                      />
                      <span style={{ color: nameColor }}>{category}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: searchBorderColor }}>
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-2 rounded-lg transition-all hover:opacity-80"
                    style={{
                      backgroundColor: searchBgColor,
                      color: searchTextColor,
                    }}
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg transition-all hover:opacity-90"
                    style={{
                      backgroundColor: arrowColor,
                      color: "white",
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
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

        {/* Services by Category */}
        {!loading && Object.entries(groupedServices).map(([category, categoryServices]) => {
          if (categoryServices.length === 0) return null;
          
          const isExpanded = expandedCategories.has(category);
          const displayServices = isExpanded || categoryServices.length <= initialItemsToShow
            ? categoryServices
            : categoryServices.slice(0, initialItemsToShow);
          const showExpandButton = showSeeAll && categoryServices.length > initialItemsToShow;
          
          return (
            <div key={category} className="mb-8 sm:mb-12">
              {/* Category Header with See All Button */}
              {(showCategoryTitles || showExpandButton) && (
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  {showCategoryTitles && (
                    <h3
                      className="font-bold"
                      style={{ 
                        color: categoryTitleColor,
                        fontSize: categoryTitleSize
                      }}
                    >
                      {category}
                    </h3>
                  )}
                  {!showCategoryTitles && <div></div>}
                  {showExpandButton && (
                    <button
                      onClick={() => toggleCategoryExpansion(category)}
                      className="font-semibold flex items-center gap-2 hover:underline whitespace-nowrap transition-all"
                      style={{ 
                        color: seeAllColor,
                        fontSize: getResponsiveValue(seeAllSizeMobile, seeAllSizeTablet, seeAllSizeDesktop)
                      }}
                    >
                      {isExpanded ? viewLessText : seeAllText}
                      <ChevronRight 
                        className="transition-transform duration-300"
                        style={{ 
                          width: getResponsiveValue('16px', '18px', '20px'),
                          height: getResponsiveValue('16px', '18px', '20px'),
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                        }} 
                      />
                    </button>
                  )}
                </div>
              )}

              {/* Services Carousel or Grid */}
              <div className="relative">
                {/* Navigation Arrows - Only show when NOT expanded and showArrows is true */}
                {showArrows && !isExpanded && (
                  <>
                    <button
                      onClick={(e) => {
                        const container = e.currentTarget.parentElement?.querySelector('.services-scroll') as HTMLDivElement;
                        if (container) handleScroll(category, 'left', container);
                      }}
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-lg transition-all hover:scale-110",
                        showArrowsMobile ? "flex" : "hidden md:flex"
                      )}
                      style={{
                        backgroundColor: arrowBgColor,
                        color: arrowColor,
                      }}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={(e) => {
                        const container = e.currentTarget.parentElement?.querySelector('.services-scroll') as HTMLDivElement;
                        if (container) handleScroll(category, 'right', container);
                      }}
                      className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-lg transition-all hover:scale-110",
                        showArrowsMobile ? "flex" : "hidden md:flex"
                      )}
                      style={{
                        backgroundColor: arrowBgColor,
                        color: arrowColor,
                      }}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Container - Grid on mobile, Carousel on desktop when collapsed */}
                <div
                  className={cn(
                    "transition-all duration-500",
                    isExpanded 
                      ? "" // Grid layout when expanded
                      : "md:services-scroll md:overflow-x-auto md:scrollbar-hide md:-mx-2 md:px-2 md:snap-x md:snap-mandatory" // Carousel only on desktop when collapsed
                  )}
                  style={isExpanded ? {} : { scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <div
                    className={cn(
                      "transition-all duration-500 gap-4 md:gap-6",
                      isExpanded
                        ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // Grid when expanded (2 cols on mobile)
                        : "grid grid-cols-2 md:flex" // Grid 2 cols on mobile, carousel on desktop when collapsed
                    )}
                    style={isExpanded ? {} : { minWidth: "min-content" }}
                  >
                    {displayServices.map((service) => {
                      const cardWidth = getResponsiveValue(cardWidthMobile, cardWidthTablet, cardWidthDesktop);
                      const imageHeight = getResponsiveValue(cardImageHeightMobile, cardImageHeightTablet, cardImageHeightDesktop);
                      
                      const handleServiceClick = (e: React.MouseEvent) => {
                        if (useDrawerForBooking && drawerControl && bookingContext) {
                          e.preventDefault();
                          bookingContext.setPreSelectedService(service.id, "staff");
                          drawerControl.openDrawer();
                        }
                        // Otherwise, let the link navigate normally
                      };

                      const CardWrapper = useDrawerForBooking && drawerControl ? "button" : "a";
                      
                      return (
                        <CardWrapper
                          key={service.id}
                          {...(useDrawerForBooking && drawerControl 
                            ? { onClick: handleServiceClick, type: "button" as const }
                            : { href: cardLinkTemplate.replace('{id}', service.id) }
                          )}
                          className={cn(
                            "rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer text-left",
                            isExpanded ? "w-full" : "w-full md:flex-none md:snap-center"
                          )}
                          style={{
                            width: isExpanded ? "auto" : windowWidth >= 768 ? `${cardWidth}px` : undefined,
                            backgroundColor: cardBgColor,
                            border: "none",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = cardHoverColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = cardBgColor;
                          }}
                        >
                          {/* Service Image */}
                          <div
                            className="relative w-full overflow-hidden bg-gray-200"
                            style={{ height: `${imageHeight}px` }}
                          >
                            {service.photo ? (
                              <Image
                                src={service.photo}
                                alt={service.displayName || service.name}
                                fill
                                className="object-cover"
                                unoptimized={service.photo.startsWith('http')}
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
                                {((service.displayName || service.name) ?? "").charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Service Info */}
                          <div className="p-4 sm:p-5">
                            <p
                              className="font-semibold mb-1"
                              style={{ 
                                color: priceColor,
                                fontSize: priceFontSize,
                                textTransform: "uppercase"
                              }}
                            >
                              {service.displayPrice}
                            </p>
                            <h4
                              className="font-bold mb-1"
                              style={{ 
                                color: nameColor,
                                fontSize: nameFontSize
                              }}
                            >
                              {service.displayName || service.name}
                            </h4>
                            {showDuration && (
                              <p
                                style={{ 
                                  color: durationColor,
                                  fontSize: durationFontSize
                                }}
                              >
                                {service.durationDisplay}
                              </p>
                            )}
                          </div>
                        </CardWrapper>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* No Results */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: durationColor }}>
              No services found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .services-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

