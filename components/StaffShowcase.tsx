"use client";

import { CSSProperties, useState, useEffect } from "react";
import Image from "next/image";
// no navigation; we use button cards
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

interface Staff {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  image_link?: string;
  photo?: string; // Data_barbers photo URL
  ghl_id?: string;
  acuity_id?: string;
}

export interface StaffShowcaseProps {
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
}

export default function StaffShowcase({
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
}: StaffShowcaseProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [barberName, setBarberName] = useState("");
  const [barberBio, setBarberBio] = useState("");
  const [barberPhoto, setBarberPhoto] = useState("");
  const [services, setServices] = useState<{ id: string; name: string; photo?: string; duration?: number | null; price?: number | null }[]>([]);

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

  const openBarberPanel = (member: Staff) => {
    (async () => {
      try {
        setPanelOpen(true);
        setPanelLoading(true);
        setPanelError(null);
        setBarberName("");
        setBarberBio("");
        setBarberPhoto("");

        // Fetch all barbers and match by GHL_id first, then by id
        const resp = await fetch("/api/data_barbers", { cache: "no-store" });
        if (!resp.ok) throw new Error(`Failed to fetch barber profile (${resp.status})`);
        const rows: any[] = await resp.json();
        const effectiveId = String(member.ghl_id || member.id || "");
        const match = (rows || []).find((r: any) => {
          const candidates = [r?.["GHL_id"], r?.["User/ID"], r?.id, r?.["🔒 Row ID"], r?.["Row ID"], r?.row_id]
            .map((v: any) => (v != null ? String(v) : ""));
          return candidates.includes(effectiveId);
        });
        if (!match) throw new Error("Barber profile not found");

        setBarberName(match?.["Barber/Name"] || member.name || "");
        setBarberBio(match?.["Barber/Bio"] || "");
        setBarberPhoto(match?.["Barber/Photo"] || member.photo || member.image_link || "");

        // Load services strictly from Services/List (CSV of ghl_calendar_id)
        const serviceIds = String(match?.["Services/List"] || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        if (serviceIds.length === 0) {
          setServices([]);
        } else {
          // Fetch base and custom in parallel
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

          // Build the union of Services/List + any custom rows for this barber
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

          const prepared: { id: string; name: string; photo?: string; duration?: number | null; price?: number | null }[] = [];
          for (const sidRaw of Array.from(unionIdsSet)) {
            const sid = String(sidRaw);
            const base = svcMap.get(sid);
            if (!base) continue;

            // Find custom override for this barber+service via ghl_calendar_id and either Barber/ID OR Barber/Name Lookup (fallback)
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

            const duration = custom && Number.isFinite(Number(custom?.['Barber/Duration']))
              ? Number(custom?.['Barber/Duration'])
              : baseDur;
            const price = custom && Number.isFinite(Number(custom?.['Barber/Price']))
              ? Number(custom?.['Barber/Price'])
              : basePrice;

            const customLookup = (custom?.["Service/Lookup"] ?? "").toString().trim();
            const baseDisplayRaw = (base?.["Service/Display Name"] ?? "").toString();
            const baseNameRaw = (base?.["Service/Name"] ?? "").toString();
            const baseDisplay = baseDisplayRaw.replace(/^\s+|\s+$/g, "");
            const baseName = baseNameRaw.replace(/^\s+|\s+$/g, "");
            const displayInvalid = !baseDisplay || baseDisplay === "\\" || baseDisplay === "\\\\" || baseDisplay.length <= 1;
            const displayName = customLookup || (!displayInvalid ? baseDisplay : (baseName || "Service"));

            prepared.push({
              id: sid,
              name: displayName,
              photo: base?.["Service/Photo"] || undefined,
              duration,
              price,
            });
          }
          try { console.debug('[StaffShowcase] services prepared (desktop path)', { barberRowId, count: prepared.length, ids: serviceIds }); } catch {}
          try { console.debug('[StaffShowcase] services prepared (mobile path)', { barberRowId, count: prepared.length, ids: serviceIds }); } catch {}
          setServices(prepared);
        }
      } catch (e: any) {
        setPanelError(e?.message || String(e));
      } finally {
        setPanelLoading(false);
      }
    })();
  };

  function closePanel() {
    setPanelOpen(false);
  }

  // Build responsive grid classes
  const gridColsClass = `grid-cols-${columnsMobile} md:grid-cols-${columnsTablet} lg:grid-cols-${columnsDesktop}`;

  return (
    <section
      className={cn("w-full py-8 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8", className)}
      style={{
        ...style,
        backgroundColor: bgColor,
      }}
      onClickCapture={(e) => {
        // If Plasmic or parent wrappers add an <a> around our card, block navigation
        let el = e.target as HTMLElement | null;
        let insideStaffCard = false;
        while (el) {
          if (el.getAttribute && el.getAttribute("data-staff-card") === "true") {
            insideStaffCard = true;
          }
          if (el.tagName === "A" && insideStaffCard) {
            e.preventDefault();
            e.stopPropagation();
            break;
          }
          el = el.parentElement;
        }
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
              
              return (
                <button
                  key={member.id}
                  type="button"
                  data-staff-card="true"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openBarberPanel(member); }}
                  className="text-left w-full group overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105"
                  style={{
                    backgroundColor: cardBgColor,
                    borderRadius: cardBorderRadius,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = cardHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = cardBgColor;
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
                </button>
              );
            })}
          </div>
        )}
      </div>

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
                    {services.length > 0 && (
                      <div className="mt-8">
                        <div className="font-semibold mb-4">Services</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {services.map((s) => {
                            const durationText = s.duration ? `${s.duration} mins` : "";
                            const priceText = s.price != null ? `$${s.price.toFixed(2)}` : "";
                            return (
                              <div
                                key={s.id}
                                className="group rounded-xl border border-gray-200 hover:shadow-lg transition p-3 flex gap-3 bg-white"
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
            {/* Hide default close icon from SheetContent to avoid duplicates */}
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
                    {services.length > 0 && (
                      <div className="mt-3">
                        <div className="font-semibold mb-2">Services</div>
                      <div className="grid grid-cols-2 gap-3">
                          {services.map((s) => {
                            const durationText = s.duration ? `${s.duration} mins` : "";
                            const priceText = s.price != null ? `$${s.price.toFixed(2)}` : "";
                            return (
                            <div key={s.id} className="rounded-xl border border-gray-200 bg-transparent shadow-md p-3 flex gap-3">
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
                  {/* Keep a secondary services section off on mobile to avoid duplication */}
                  {false && services.length > 0 && (
                    <div className="mt-4">
                      <div className="font-semibold mb-3">Services</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {services.map((s) => {
                          const durationText = s.duration ? `${s.duration} mins` : "";
                          const priceText = s.price != null ? `$${s.price.toFixed(2)}` : "";
                          return (
                            <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-3 flex gap-3">
                              <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                {s.photo ? (
                                  <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                                ) : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{s.name}</div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                                  {durationText && (
                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5">{durationText}</span>
                                  )}
                                  {priceText && (
                                    <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-700 px-2 py-0.5">{priceText}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </section>
  );
}
