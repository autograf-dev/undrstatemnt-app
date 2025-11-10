"use client";

import { CSSProperties, useState, useEffect } from "react";
import Image from "next/image";
import { useDrawerControl } from "./PageShellWithHeader";
import { useBooking } from "@/contexts/BookingContext";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  calendarId?: string;
  name: string;
  photo?: string;
  duration?: number | null;
  price?: number | null;
}

export interface StaffProfilePageProps {
  className?: string;
  style?: CSSProperties;
  /** Staff slug from URL */
  slug: string;
  /** API endpoint to fetch staff data */
  apiPath?: string;
}

export default function StaffProfilePage({
  className,
  style,
  slug,
  apiPath = "/api/supabasestaff",
}: StaffProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barberName, setBarberName] = useState("");
  const [barberBio, setBarberBio] = useState("");
  const [barberPhoto, setBarberPhoto] = useState("");
  const [barberId, setBarberId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [windowWidth, setWindowWidth] = useState(0);
  
  const drawerControl = (() => { try { return useDrawerControl(); } catch { return null; } })();
  const bookingContext = (() => { try { return useBooking(); } catch { return null; } })();

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadStaffProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all staff
        const staffRes = await fetch(apiPath);
        if (!staffRes.ok) throw new Error(`Failed to fetch staff (${staffRes.status})`);
        const staffList: any[] = await staffRes.json();

        // Find staff by slug (match by first name only - before any hyphen or space)
        const generateSlug = (name: string) => {
          return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        };
        const member = staffList.find((s: any) => {
          // Extract only the first word (before any hyphen or space) from firstname or name
          const firstNameOnly = (s.firstname || s.name || '').split(/[\s-]+/)[0];
          const staffSlug = generateSlug(firstNameOnly);
          return staffSlug === slug;
        });

        if (!member) {
          throw new Error("Staff member not found");
        }

        // Fetch barber profile from data_barbers
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

        if (!match) {
          // Fallback to basic info from staff API
          setBarberName(member.name || "");
          setBarberBio("");
          setBarberPhoto(member.photo || member.image_link || "");
          setServices([]);
          setLoading(false);
          return;
        }

        setBarberName(match?.["Barber/Name"] || member.name || "");
        setBarberBio(match?.["Barber/Bio"] || "");
        setBarberPhoto(match?.["Barber/Photo"] || member.photo || member.image_link || "");

        // Load services
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

          const prepared: Service[] = [];
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
              calendarId: calId || undefined,
              name: displayName,
              photo: base?.["Service/Photo"] || undefined,
              duration,
              price,
            });
          }
          setServices(prepared);
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadStaffProfile();
    }
  }, [slug, apiPath]);

  const handleServiceClick = (service: Service) => {
    const calId = service.calendarId || service.id;
    try { console.log('[StaffProfilePage] Barber:', barberName); } catch {}
    try {
      if (drawerControl && bookingContext) {
        bookingContext.setPreSelectedServiceAndStaff(
          String(calId),
          String(barberId),
          {
            duration: service.duration ?? null,
            price: service.price ?? null,
            serviceName: service.name || null,
            staffName: barberName || null
          }
        );
        drawerControl.openDrawer();
      }
    } catch (e) {
      console.error("Error opening booking drawer:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div
      className={cn("w-full py-8 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8", className)}
      style={style}
    >
      <div className="mx-auto" style={{ maxWidth: "1280px" }}>
        {/* Desktop Layout: Side by side */}
        {windowWidth >= 1024 ? (
          <div className="grid grid-cols-2 gap-8 items-start">
            {/* Photo */}
            <div className="w-full overflow-hidden rounded-xl bg-gray-100">
              {barberPhoto ? (
                <img
                  src={barberPhoto}
                  alt={barberName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="w-full h-full min-h-[360px] grid place-items-center text-gray-500">
                  No photo
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{barberName || "Barber"}</h1>
              {barberBio ? (
                <p className="leading-relaxed text-[15px] text-gray-800 mb-8">{barberBio}</p>
              ) : (
                <p className="text-gray-600 mb-8">No bio available.</p>
              )}
              
              {services.length > 0 && (
                <div>
                  <div className="font-semibold text-xl mb-4">Services</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((s) => {
                      const durationText = s.duration ? `${s.duration} mins` : "";
                      const priceText = s.price != null ? `$${s.price.toFixed(2)}` : "";
                      return (
                        <div
                          key={s.id}
                          className="group rounded-xl border border-gray-200 hover:shadow-lg transition p-3 flex gap-3 bg-white cursor-pointer"
                          onClick={() => handleServiceClick(s)}
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
        ) : (
          /* Mobile/Tablet Layout: Stacked */
          <div className="flex flex-col gap-4">
            {/* Photo */}
            <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
              {barberPhoto ? (
                <img
                  src={barberPhoto}
                  alt={barberName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-gray-500">
                  No photo
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-xl font-bold">{barberName || "Barber"}</h1>
              {services.length > 0 && (
                <div className="mt-3">
                  <div className="font-semibold mb-2">Services</div>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map((s) => {
                      const durationText = s.duration ? `${s.duration} mins` : "";
                      const priceText = s.price != null ? `$${s.price.toFixed(2)}` : "";
                      return (
                        <div
                          key={s.id}
                          className="rounded-xl border border-gray-200 bg-transparent shadow-md p-3 flex gap-3 cursor-pointer"
                          onClick={() => handleServiceClick(s)}
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
    </div>
  );
}

