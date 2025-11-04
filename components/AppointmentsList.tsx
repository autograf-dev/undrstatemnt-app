"use client";

import { useEffect, useMemo, useState } from "react";

type Booking = {
  id: string;
  location_id?: string | null;
  contact_id?: string | null;
  assigned_user_id?: string | null;
  appointment_status?: string | null;
  title?: string | null;
  start_time?: string | null; // ISO
  end_time?: string | null;   // ISO
  raw?: any;
  updated_at?: string | null;
  calendar_id?: string | null;
  glide_row_id?: string | null;
  date_id?: string | null;
  summary?: string | null;
  payment_status?: string | null;
  customer_phone_number?: string | null;
};

export interface AppointmentsListProps {
  className?: string;
  title?: string;
  subtitle?: string;
  emptyText?: string;
  containerMaxWidth?: string;
  // Colors / styles
  brandColor?: string;
  cardBgColor?: string;
  borderColor?: string;
  textPrimary?: string;
  textMuted?: string;
  chipBg?: string;
  showHeader?: boolean;
}

export default function AppointmentsList({
  className,
  title = "Your bookings",
  subtitle = "Here's what's coming up. Need to make changes? Just reschedule or cancel below.",
  emptyText = "No upcoming bookings.",
  containerMaxWidth = "860px",
  brandColor = "#D97639",
  cardBgColor = "#ffffff",
  borderColor = "#e5e7eb",
  textPrimary = "#0f172a",
  textMuted = "#6b7280",
  chipBg = "#f3f4f6",
  showHeader = true,
}: AppointmentsListProps) {
  const [contactId, setContactId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      setContactId(id);
    } catch {}
  }, []);

  useEffect(() => {
    if (!contactId) return;
    let aborted = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/fetchBookings?contactId=${encodeURIComponent(contactId)}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch bookings");
        if (aborted) return;
        setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Failed to load bookings");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [contactId]);

  const processed = useMemo(() => {
    const now = Date.now();
    const normalizeIso = (b: Booking, keyTop: "start_time" | "end_time", keyRaw: "startTime" | "endTime") => {
      return (b.raw?.[keyRaw] as string | null) || (b[keyTop] as string | null) || null;
    };
    const startCompare = (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime();

    const enriched = (bookings || []).map((b) => {
      const startIso = normalizeIso(b, "start_time", "startTime");
      const endIso = normalizeIso(b, "end_time", "endTime");
      const status = (b.raw?.appointmentStatus || b.raw?.appoinmentStatus || b.appointment_status || "").toLowerCase();
      const serviceName = b.raw?.serviceName || b.title || "Untitled Booking";
      const staffName = b.raw?.staffName || "";
      return {
        id: b.id,
        startIso,
        endIso,
        status,
        serviceName,
        staffName,
        raw: b.raw || {},
      };
    });

    const futureOnly = enriched.filter((e) => {
      if (!e.startIso) return false;
      const t = new Date(e.startIso).getTime();
      return Number.isFinite(t) && t >= now;
    });

    const confirmed = futureOnly.filter((e) => e.status === "confirmed").sort((a, b) => startCompare(a.startIso, b.startIso));
    const cancelled = futureOnly.filter((e) => e.status === "cancelled").sort((a, b) => startCompare(a.startIso, b.startIso));

    return [...confirmed, ...cancelled];
  }, [bookings]);

  function formatToEdmonton(iso?: string | null) {
    if (!iso) return "N/A";
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-US", {
        timeZone: "America/Edmonton",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return iso || "";
    }
  }

  function formatDuration(startIso?: string | null, endIso?: string | null) {
    if (!startIso || !endIso) return "—";
    const mins = Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m} mins`;
  }

  function priority(startIso?: string | null) {
    if (!startIso) return "normal" as const;
    const ms = new Date(startIso).getTime() - Date.now();
    const hrs = ms / 36e5;
    if (hrs < 0) return "closed" as const;
    if (hrs < 2) return "urgent" as const;
    if (hrs < 24) return "warning" as const;
    return "normal" as const;
  }

  return (
    <section className={className}>
      <div className="mx-auto" style={{ maxWidth: containerMaxWidth, color: textPrimary }}>
        {showHeader && (
          <header className="rounded-2xl border shadow-sm text-center px-4 sm:px-6 py-6 sm:py-8"
            style={{ borderColor, background: cardBgColor }}>
            <div className="text-xs font-bold tracking-wider uppercase" style={{ color: textMuted }}>UNDRSTATEMNT COMPANY</div>
            <h1 className="mt-2 font-extrabold tracking-tight" style={{ fontSize: "clamp(24px,3.5vw,34px)" }}>{title}</h1>
            <p className="mt-2 text-sm" style={{ color: textMuted }}>{subtitle}</p>
          </header>
        )}

        <main className="pt-5 sm:pt-6">
          {(!contactId || error) && (
            <div className="text-center text-base" style={{ color: textMuted }}>
              {!contactId ? "We couldn’t find your link. Add ?id=contactId to the URL." : `Failed to load: ${error}`}
            </div>
          )}

          {loading && (
            <div className="grid gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-5 shadow-sm"
                  style={{ borderColor, background: cardBgColor }}>
                  <div className="animate-pulse space-y-3">
                    <div className="h-5 w-2/3 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                    <div className="h-3 w-4/5 rounded bg-gray-200" />
                    <div className="h-3 w-3/5 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && contactId && processed.length === 0 && (
            <div className="text-center text-base" style={{ color: textMuted }}>{emptyText}</div>
          )}

          {!loading && processed.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {processed.map((b) => {
                const isCancelled = b.status === "cancelled";
                const pri = priority(b.startIso);
                const priClass = pri === "urgent" ? "bg-red-50 text-red-700 border-red-200"
                  : pri === "warning" ? "bg-amber-50 text-amber-700 border-amber-200"
                  : pri === "closed" ? "bg-gray-100 text-gray-700 border-gray-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200";
                return (
                  <div key={b.id} className="rounded-2xl border shadow-sm p-4 sm:p-5"
                    style={{ borderColor, background: cardBgColor }}>
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3" style={{ borderColor }}>
                      <h3 className="font-extrabold text-[1.05rem] sm:text-[1.15rem] flex items-center gap-2">
                        {b.serviceName}
                        {!isCancelled && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${priClass}`}> 
                            {(() => {
                              const ms = new Date(b.startIso!).getTime() - Date.now();
                              if (ms < 0) return "Event closed";
                              const hours = Math.floor(ms / 36e5);
                              const minutes = Math.floor((ms % 36e5) / 6e4);
                              if (hours > 24) {
                                const days = Math.floor(hours / 24);
                                return `in ${days}d ${hours % 24}h`;
                              } else if (hours > 0) {
                                return `in ${hours}h ${minutes}m`;
                              } else {
                                return `in ${minutes}m`;
                              }
                            })()}
                          </span>
                        )}
                      </h3>
                      <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold"
                        style={{ background: isCancelled ? chipBg : "#eef2f7", color: textPrimary, borderColor }}>
                        {isCancelled ? "Cancelled" : `with ${b.staffName || "Unassigned"}`}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="text-[12px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>Start Time</div>
                        <div className="font-semibold">{formatToEdmonton(b.startIso)}</div>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>Duration</div>
                        <div className="font-semibold">{formatDuration(b.startIso, b.endIso)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <style jsx>{`
        :global(.btn-primary){ background:${brandColor}; color:#fff }
      `}</style>
    </section>
  );
}


