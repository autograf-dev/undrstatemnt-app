"use client";

import * as React from "react";

type BarberRow = Record<string, any>;
type ServiceRow = Record<string, any>;

export type BarberProfileProps = {
  id?: string; // optional; if not provided, derive from URL (/barber/[id])
  className?: string;
  style?: React.CSSProperties;
};

type EffectiveService = {
  id: string;
  name: string;
  photo?: string | null;
  category?: string | null;
  baseDurationMins?: number | null;
  basePrice?: number | null;
  displayDuration?: string | null;
  displayPrice?: string | null;
  effectivePrice?: number | null; // from custom override if available
  effectiveDuration?: number | null; // minutes; from custom override if available
};

async function fetchJson<T>(url: string): Promise<T> {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
  return resp.json();
}

function splitServiceIds(csv: any): string[] {
  if (!csv || typeof csv !== "string") return [];
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asNumber(val: any): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function getIdFromCurrentUrl(): string | null {
  try {
    const href = typeof window !== "undefined" ? window.location.href : "";
    if (!href) return null;
    const url = new URL(href);
    // Prefer query param ?id=...
    const qp = url.searchParams.get("id");
    if (qp) return qp;
    // Fallback: last segment in /barber/[id]
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length > 1 && parts[0].toLowerCase() === "barber") {
      return parts[1] || null;
    }
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export default function BarberProfile(props: BarberProfileProps) {
  const { id: idProp, className, style } = props;
  const [barber, setBarber] = React.useState<BarberRow | null>(null);
  const [services, setServices] = React.useState<EffectiveService[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const effectiveId = String(idProp ?? getIdFromCurrentUrl() ?? "");
        if (!effectiveId) throw new Error("Missing barber id in URL or props");

        // 1) Load all barbers and find the matching record by either key
        const barbers: BarberRow[] = await fetchJson("/api/data_barbers");
        const found = (barbers || []).find((b: BarberRow) => {
          const candidates = [
            b?.["GHL_id"],
            b?.["🔒 Row ID"],
            b?.["Row ID"],
            b?.row_id,
            b?.id,
            b?.["User/ID"],
            b?.user_id,
          ]
            .map((v: any) => (v != null ? String(v) : ""));
          return candidates.includes(String(effectiveId));
        }) || null;

        if (!found) {
          throw new Error("Barber not found");
        }
        if (cancelled) return;
        setBarber(found);

        // 2) Load services and map those in barber's Services/List
        const servicesAll: ServiceRow[] = await fetchJson("/api/data_services");
        const serviceIds = splitServiceIds(found?.["Services/List"]);
        const byId = new Map<string, ServiceRow>();
        for (const row of servicesAll || []) {
          const candidates = [
            row?.["glide_row_id"],
            row?.["🔒 Row ID"],
            row?.id,
            row?.["Row ID"],
            row?.row_id,
            row?.["Service/ID"],
          ]
            .map((v: any) => (v != null ? String(v) : ""));
          for (const c of candidates) {
            if (c) byId.set(c, row);
          }
        }

        // 3) Build EffectiveService list, resolving custom overrides via supabaseservices
        const barberId = String(
          found?.["🔒 Row ID"] ?? found?.["Row ID"] ?? found?.id ?? found?.row_id ?? found?.["User/ID"] ?? found?.["GHL_id"] ?? ""
        );
        const prepared: EffectiveService[] = [];
        for (const sid of serviceIds) {
          const base = byId.get(sid);
          if (!base) continue;
          const name = (base?.["Service/Display Name"] || base?.["Service/Name"]) as string;
          const photo = base?.["Service/Photo"] ?? null;
          const category = base?.["Service/Category"] ?? null;
          const baseDurationMins = asNumber(base?.["Service/Display.Mins"]) ?? asNumber(base?.["Service/Duration"]) ?? null;
          const basePrice = asNumber(base?.["Service/Default Price"]) ?? null;
          const displayDuration = (base?.["Service/Display Duration"] || base?.["Service/Duration.Display"]) ?? null;
          const displayPrice = base?.["Service/Display Price"] ?? null;

          // Query effective values (default or custom override)
          let effectivePrice: number | null = null;
          let effectiveDuration: number | null = null;
          try {
            if (sid) {
              const eff = await fetchJson<{ duration: number; price: number }>(
                `/api/supabaseservices?serviceId=${encodeURIComponent(sid)}&barberId=${encodeURIComponent(barberId)}`
              );
              if (eff) {
                effectivePrice = asNumber((eff as any).price);
                effectiveDuration = asNumber((eff as any).duration);
              }
            }
          } catch {
            // Non-fatal; fall back to base values
          }

          prepared.push({
            id: sid,
            name,
            photo,
            category,
            baseDurationMins,
            basePrice,
            displayDuration,
            displayPrice,
            effectivePrice: effectivePrice ?? basePrice,
            effectiveDuration: effectiveDuration ?? baseDurationMins,
          });
        }

        if (!cancelled) setServices(prepared);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const name = (barber?.["Barber/Name"] || barber?.name || "") as string;
  const bio = (barber?.["Barber/Bio"] || barber?.bio || "") as string;
  const photo = (barber?.["Barber/Photo"] || barber?.photo || "") as string;

  return (
    <div className={className} style={style}>
      {/* Top section: image left, name+bio right on desktop; stacked on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: 16,
                }}
              >
                {/* Responsive two-column wrapper using CSS media queries inline via container queries is limited; rely on simple switch */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      overflow: "hidden",
                      borderRadius: 12,
                      background: "#f2f2f2",
                    }}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#888" }}>
                        No photo
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{name || "Barber"}</div>
                    {bio ? (
                      <p style={{ marginTop: 8, lineHeight: 1.6 }}>{bio}</p>
                    ) : (
                      <p style={{ marginTop: 8, color: "#666" }}>No bio available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Services</div>
        {loading && <div>Loading…</div>}
        {error && <div style={{ color: "#b00020" }}>{error}</div>}
        {!loading && !error && services.length === 0 && <div>No services found.</div>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12,
          }}
        >
          {services.map((svc) => (
            <div
              key={svc.id}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr",
                gap: 12,
                alignItems: "center",
                padding: 12,
                border: "1px solid #eee",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#f7f7f7",
                }}
              >
                {svc.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={svc.photo} alt={svc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#aaa" }}>No image</div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{svc.name}</div>
                <div style={{ color: "#666", marginTop: 4 }}>
                  {svc.effectiveDuration != null
                    ? `${svc.effectiveDuration} mins`
                    : svc.displayDuration || `${svc.baseDurationMins ?? ""} mins`}
                  {" "}• {svc.effectivePrice != null ? `$${svc.effectivePrice.toFixed(2)}` : svc.displayPrice || (svc.basePrice != null ? `$${svc.basePrice.toFixed(2)}` : "")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basic responsive enhancement via a small media override */}
      <style>{`
        @media (min-width: 900px) {
          /* Top section splits into two columns: image left, text right */
          .plsmc-barber-top { display: grid; grid-template-columns: 360px 1fr; gap: 24px; }
        }
      `}</style>
    </div>
  );
}


