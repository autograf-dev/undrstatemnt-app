"use client";

import { CSSProperties, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useDrawerControl } from "./PageShellWithHeader";
import { useBooking } from "@/contexts/BookingContext";

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
  photo?: string; // Added for Data_barbers photo URL
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
  // Try to get booking drawer control and context
  let drawerControl: any = null;
  let bookingContext: any = null;
  try {
    drawerControl = require('./PageShellWithHeader').useDrawerControl();
    bookingContext = require('@/contexts/BookingContext').useBooking();
  } catch {}

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [barberName, setBarberName] = useState("");
  const [barberBio, setBarberBio] = useState("");
  const [barberPhoto, setBarberPhoto] = useState("");
  const [barberId, setBarberId] = useState("");
  const [servicesList, setServicesList] = useState<{ id: string; calendarId?: string; name: string; photo?: string; duration?: number | null; price?: number | null }[]>([]);

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
        if (Array.isArray(data)) {
          setStaff(data);
        } else {
          setStaff([]);
          if (data && data.error) {
            console.error("Staff API error:", data.error);
          } else {
            console.error("Staff API returned non-array response", data);
          }
        }
      } catch (error) {
        setStaff([]);
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [apiPath]);

  const openBarberPanel = (member: Staff) => {
    (async () => {
      try {
        setPanelOpen(true);
        setPanelLoading(true);
        setPanelError(null);
        setBarberName("");
        setBarberBio("");
        setBarberPhoto("");
        setBarberId("");

        const resp = await fetch("/api/data_barbers", { cache: "no-store" });
        if (!resp.ok) throw new Error(`Failed to fetch barber profile (${resp.status})`);
        const rows: any[] = await resp.json();
        const effectiveId = String(member.ghl_id || member.id || "");
        setBarberId(effectiveId);
        const match = (rows || []).find((r: any) => {
          const candidates = [r?.["GHL_id"], r?.["User/ID"], r?.id, r?.["🔒 Row ID"], r?.["Row ID"], r?.row_id]
            .map((v: any) => (v != null ? String(v) : ""));
          return candidates.includes(effectiveId);
        });
        if (!match) throw new Error("Barber profile not found");

        setBarberName(match?.["Barber/Name"] || member.name || "");
        setBarberBio(match?.["Barber/Bio"] || "");
        setBarberPhoto(match?.["Barber/Photo"] || member.photo || member.image_link || "");

        const serviceIds = String(match?.["Services/List"] || "")
          .split(",").map((s: string) => s.trim()).filter(Boolean);

        if (serviceIds.length === 0) {
          setServicesList([]);
        } else {
          const [servicesResp, customResp] = await Promise.all([
            fetch("/api/data_services", { cache: "no-store" }),
            fetch("/api/data_services_custom", { cache: "no-store" }).catch(() => null as any),
          ]);
          const svcRows: any[] = servicesResp?.ok ? await servicesResp.json() : [];
          const customRows: any[] = customResp && customResp.ok ? await customResp.json() : [];

          const svcMap = new Map<string, any>();
          for (const r of svcRows || []) {
            const calKey = String(r?.["ghl_calendar_id"] || "");
            const rowKey = String(r?.["🔒 Row ID"] || r?.["Row ID"] || r?.id || r?.row_id || "");
            if (calKey) svcMap.set(calKey, r);
            if (rowKey) svcMap.set(rowKey, r);
          }
          const barberRowId = String(match?.["🔒 Row ID"] || match?.["Row ID"] || match?.id || match?.row_id || "");
          const barberNameFromRow = String(match?.["Barber/Name"] || member.name || "");
          const normalize = (s: any) => String(s ?? "").trim().toLowerCase();
          const barberNameKey = normalize(barberNameFromRow);

          const customForBarber = (customRows || []).filter((c: any) => {
            const idMatch = String(c?.['Barber/ID'] || '') === barberRowId && barberRowId !== '';
            const nameMatch = normalize(c?.['Barber/Name Lookup']) === barberNameKey && barberNameKey !== '';
            return idMatch || nameMatch;
          });
          const unionIdsSet = new Set<string>(serviceIds.map((x: string) => String(x)));
          for (const c of customForBarber) {
            const cal = String(c?.['ghl_calendar_id'] || '');
            if (cal) unionIdsSet.add(cal);
          }

          const prepared: { id: string; calendarId?: string; name: string; photo?: string; duration?: number | null; price?: number | null }[] = [];
          for (const sidRaw of Array.from(unionIdsSet)) {
            const sid = String(sidRaw);
            const base = svcMap.get(sid);
            if (!base) continue;
            const calId = String(base?.['ghl_calendar_id'] || '');
            const custom = (customRows || []).find((c: any) => {
              const calMatch = String(c?.['ghl_calendar_id'] || '') === calId;
              if (!calMatch) return false;
              const idMatch = String(c?.['Barber/ID'] || '') === barberRowId && barberRowId !== '';
              const nameMatch = normalize(c?.['Barber/Name Lookup']) === barberNameKey && barberNameKey !== '';
              return idMatch || nameMatch;
            });
            const baseDur = Number(base?.["Service/Display.Mins"]) || Number(base?.["Service/Duration"]) || null;
            const basePrice = Number(base?.["Service/Default Price"]) || null;
            const duration = custom && Number.isFinite(Number(custom?.['Barber/Duration'])) ? Number(custom?.['Barber/Duration']) : baseDur;
            const price = custom && Number.isFinite(Number(custom?.['Barber/Price'])) ? Number(custom?.['Barber/Price']) : basePrice;
            const customLookup = (custom?.["Service/Lookup"] ?? "").toString().trim();
            const baseDisplayRaw = (base?.["Service/Display Name"] ?? "").toString();
            const baseNameRaw = (base?.["Service/Name"] ?? "").toString();
            const baseDisplay = baseDisplayRaw.replace(/^\s+|\s+$/g, "");
            const baseName = baseNameRaw.replace(/^\s+|\s+$/g, "");
            const displayInvalid = !baseDisplay || baseDisplay === "\\" || baseDisplay === "\\\\" || baseDisplay.length <= 1;
            const displayName = customLookup || (!displayInvalid ? baseDisplay : (baseName || "Service"));
            prepared.push({ id: sid, calendarId: calId || undefined, name: displayName, photo: base?.["Service/Photo"] || undefined, duration, price });
          }
          setServicesList(prepared);
        }
      } catch (e: any) {
        setPanelError(e?.message || String(e));
      } finally {
        setPanelLoading(false);
      }
    })();
  };

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
            <a
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
            </a>
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
                  // Prefer API photo, fallback to image_link for legacy
                  const photoUrl = member.photo || member.image_link;
                  
                  const handleStaffClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    openBarberPanel(member);
                  };

                  const CardWrapper = "button" as const;
                  
                  return (
                    <CardWrapper
                      key={member.id}
                      onClick={handleStaffClick}
                      type="button"
                      className="flex-none rounded-xl overflow-hidden shadow-md mt-4 transition-all duration-300 hover:scale-105 snap-center mb-4 cursor-pointer text-left"
                      style={{
                        width: `${cardWidth}px`,
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
                      {/* Staff Image - Fully Responsive */}
                      <div
                        className="relative w-full overflow-hidden bg-gray-200"
                        style={{ height: `${imageHeight}px` }}
                      >
                        {photoUrl ? (
                          <Image
                            src={photoUrl}
                            alt={member.name}
                            fill
                            className="object-cover"
                            unoptimized={photoUrl.startsWith('http')}
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
                            {(member.firstname ?? "").charAt(0)}
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
                    </CardWrapper>
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
      {/* Desktop: right Sheet; Mobile: Bottom Drawer */}
      {windowWidth >= 1024 ? (
        <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
          <SheetContent
            side="right"
            className="z-[1000006] p-0 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] ring-1 ring-black/10 !w-[60vw] !max-w-[60vw]"
          >
            <SheetHeader className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-[1]">
              <SheetTitle>Barber Profile</SheetTitle>
              <SheetClose className="text-2xl leading-none">×</SheetClose>
            </SheetHeader>
            <div className="p-6 overflow-y-auto" style={{ height: "calc(100% - 64px)" }}>
              {panelLoading && <div>Loading…</div>}
              {panelError && <div className="text-red-600">{panelError}</div>}
              {!panelLoading && !panelError && (
                <div className="grid grid-cols-2 gap-8 items-start">
                  <div className="w-full overflow-hidden rounded-xl bg-gray-100">
                    {barberPhoto ? (
                      <img src={barberPhoto} alt={barberName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div className="w-full h-full min-h-[360px] grid place-items-center text-gray-500">No photo</div>
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-bold mb-3">{barberName || "Barber"}</div>
                    {barberBio ? (
                      <p className="leading-relaxed text-[15px] text-gray-800">{barberBio}</p>
                    ) : (
                      <p className="text-gray-600">No bio available.</p>
                    )}
                    {servicesList.length > 0 && (
                      <div className="mt-8">
                        <div className="font-semibold mb-4">Services</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {servicesList.map((s) => {
                            const durationText = s.duration ? `${s.duration} mins` : "";
                            const priceText = s.price != null ? `$${s.price.toFixed(2)}` : "";
                            return (
                              <div
                                key={s.id}
                                className="group rounded-xl border border-gray-200 hover:shadow-lg transition p-3 flex gap-3 bg-white cursor-pointer"
                                onClick={() => {
                                  const calId = (s as any).calendarId || s.id;
                                  try { console.log('[HomepageStaff] Barber:', barberName); } catch {}
                                  try {
                                    if (drawerControl && bookingContext) {
                                      bookingContext.setPreSelectedServiceAndStaff(String(calId), String(barberId), { duration: s.duration ?? null, price: s.price ?? null, serviceName: s.name || null, staffName: barberName || null });
                                      drawerControl.openDrawer();
                                      setPanelOpen(false);
                                    }
                                  } catch {}
                                }}
                              >
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                  {s.photo ? (
                                    <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-[14px] leading-tight break-words">{s.name}</div>
                                  {durationText && (
                                    <div className="mt-1 text-[11px] text-gray-600">
                                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5">{durationText}</span>
                                    </div>
                                  )}
                                  {priceText && (
                                    <div className="mt-1 text-[11px] text-gray-600">
                                      <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-700 px-2 py-0.5">{priceText}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <style>{`button[data-slot="sheet-close"]{display:none !important;}`}</style>
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={panelOpen} onOpenChange={setPanelOpen}>
          <DrawerContent roundedClassName="rounded-t-2xl" className="z-[1000006]">
            <DrawerHeader className="px-4 py-3 border-b">
              <DrawerTitle>Barber Profile</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto" data-drawer-scroll>
              {panelLoading && <div>Loading…</div>}
              {panelError && <div className="text-red-600">{panelError}</div>}
              {!panelLoading && !panelError && (
                <div className="flex flex-col gap-4">
                  <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {barberPhoto ? (
                      <img src={barberPhoto} alt={barberName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-gray-500">No photo</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xl font-bold">{barberName || "Barber"}</div>
                    {servicesList.length > 0 && (
                      <div className="mt-3">
                        <div className="font-semibold mb-2">Services</div>
                        <div className="grid grid-cols-2 gap-3">
                          {servicesList.map((s) => {
                            const durationText = s.duration ? `${s.duration} mins` : "";
                            const priceText = s.price != null ? `$${s.price.toFixed(2)}` : "";
                            return (
                              <div
                                key={s.id}
                                className="rounded-xl border border-gray-200 bg-transparent shadow-md p-3 flex gap-3 cursor-pointer"
                                onClick={() => {
                                  const calId = (s as any).calendarId || s.id;
                                  try { console.log('[HomepageStaff] Barber:', barberName); } catch {}
                                  try {
                                    if (drawerControl && bookingContext) {
                                      bookingContext.setPreSelectedServiceAndStaff(String(calId), String(barberId), { duration: s.duration ?? null, price: s.price ?? null, serviceName: s.name || null, staffName: barberName || null });
                                      drawerControl.openDrawer();
                                      setPanelOpen(false);
                                    }
                                  } catch {}
                                }}
                              >
                                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                  {s.photo ? (
                                    <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-[13px] leading-tight truncate">{s.name}</div>
                                  {durationText && (
                                    <div className="mt-1 text-[10px] text-gray-600">
                                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5">{durationText}</span>
                                    </div>
                                  )}
                                  {priceText && (
                                    <div className="mt-1 text-[10px] text-gray-600">
                                      <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-700 px-2 py-0.5">{priceText}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {barberBio ? (
                      <p className="mt-3 leading-relaxed">{barberBio}</p>
                    ) : (
                      <p className="mt-3 text-gray-600">No bio available.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </section>
  );
}

