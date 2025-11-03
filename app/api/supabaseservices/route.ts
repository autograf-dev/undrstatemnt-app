import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/server/supabase";

// --- Helpers ---
function normalizeWhitespace(s: any): string {
  if (typeof s !== "string") return "";
  return s.replace(/\s+/g, " ").trim();
}

function toBool(v: any): boolean | null {
  if (v === true || v === false) return v;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    if (["true", "yes", "1"].includes(t)) return true;
    if (["false", "no", "0", ""].includes(t)) return false;
  }
  if (v == null) return null;
  return Boolean(v);
}

function parseBarberIds(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  return String(raw)
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type ServiceRow = Record<string, any>;
type CustomRow = Record<string, any>;

function mapServiceRow(row: ServiceRow) {
  const rawName = normalizeWhitespace(row["Service/Name"] || row.name || "Unnamed Service");
  const rawDisplayName = normalizeWhitespace(row["Service/Display Name"]) || rawName;
  const duration = Number(row["Service/Duration"] ?? 0) || 0;
  const price = Number(row["Service/Default Price"] ?? 0) || 0;
  const displayPrice = row["Service/Display Price"] || (price > 0 ? `From $${price.toFixed(2)}` : "From $0.00");
  const durationDisplay = row["Service/Display Duration"] || row["Service/Duration.Display"] || `${duration} mins`;
  const category = normalizeWhitespace(row["Service/Category List"] || row["Service/Category"] || "Other");
  const barberIds = parseBarberIds(row["Barber/ID NEW"]);
  const available = toBool(row["Service/Available"]);
  const photo = typeof row["Service/Photo"] === "string" && row["Service/Photo"] ? String(row["Service/Photo"]) : null;

  return {
    id: row["glide_row_id"] || row["🔒 Row ID"] || row.id,
    name: rawName,
    displayName: rawDisplayName === "\\\\" ? rawName : rawDisplayName,
    duration,
    durationDisplay,
    price,
    displayPrice,
    photo,
    category,
    categoryList: category,
    available,
    barberIds,
    customPriceList: row["Custom/Price List"] || null,
    customPrice: typeof row["Custom/Price"] === "number" ? row["Custom/Price"] : (row["Custom/Price"] ? Number(row["Custom/Price"]) : null),
    ghl_calendar_id: row["ghl_calendar_id"] || null,
    raw: row,
  };
}

function buildBarberNameSet(customRows: CustomRow[]): Set<string> {
  const set = new Set<string>();
  for (const r of customRows || []) {
    const name = normalizeWhitespace(r["Barber/Name Lookup"] || r["Barber/Name"] || "");
    if (!name) continue;
    set.add(name.toLowerCase());
    const first = name.split(" ")[0];
    if (first) set.add(first.toLowerCase());
  }
  return set;
}

function isBarberSpecificVariant(serviceName: string, knownBarbers: Set<string>): boolean {
  const name = normalizeWhitespace(serviceName);
  // Handle patterns like "Kids cut... (Jeff)" possibly after a newline
  const match = name.match(/\(([^)]+)\)\s*$/);
  if (!match) return false;
  const inside = normalizeWhitespace(match[1]).toLowerCase();
  if (inside && knownBarbers.has(inside)) return true;
  // Also try first token
  const first = inside.split(" ")[0];
  return !!(first && knownBarbers.has(first));
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    const url = new URL(req.url);
    const serviceId = url.searchParams.get("serviceId");
    const barberId = url.searchParams.get("barberId");

    // If serviceId (+ optional barberId) is provided, return the effective parameters
    if (serviceId) {
      // Try multiple possible id column names in sequence
      let serviceRow: any = null;
      // Attempt direct eq() lookups; if any error occurs, don't fail fast — we'll fallback to a full scan next.
      for (const col of ["glide_row_id", "🔒 Row ID", "id", "ghl_calendar_id"]) {
        const { data, error } = await (supabase as any)
          .from("Data_Services")
          .select("*")
          .eq(col, serviceId)
          .maybeSingle();
        if (!error && data) { serviceRow = data; break; }
      }
      // Fallback: if not found via direct eq(), scan rows locally for any matching id shape
      if (!serviceRow) {
        const { data: allRows, error: allErr } = await (supabase as any)
          .from("Data_Services")
          .select("*");
        if (allErr) {
          console.error("Supabase error scanning services:", allErr);
        } else if (Array.isArray(allRows)) {
          const found = allRows.find((r: any) => {
            const candidates = [
              r?.["glide_row_id"],
              r?.["🔒 Row ID"],
              r?.id,
              r?.["Row ID"],
              r?.row_id,
              r?.["ghl_calendar_id"],
            ]
              .map((v: any) => (v != null ? String(v) : ""));
            return candidates.includes(String(serviceId));
          });
          if (found) serviceRow = found;
        }
      }

      if (!serviceRow) return NextResponse.json({ error: "Service not found" }, { status: 404 });

      const base = mapServiceRow(serviceRow);
      let effective = { duration: base.duration, price: base.price, source: "default" as "default" | "custom" };

      if (barberId) {
        // Build candidate sets for service ids/names and barber identifiers
        const serviceIdCandidates = new Set<string>([
          String(serviceId),
          String(serviceRow?.["glide_row_id"] || ""),
          String(serviceRow?.["🔒 Row ID"] || ""),
          String(serviceRow?.id || ""),
          String(serviceRow?.["Row ID"] || ""),
          String(serviceRow?.row_id || ""),
        ].filter(Boolean));

        const normalize = (x: any) => String(x ?? "").replace(/\s+/g, " ").trim().toLowerCase();
        const serviceNameCandidates = new Set<string>([
          normalize(serviceRow?.["Service/Name"] || serviceRow?.name || ""),
          normalize(serviceRow?.["Service/Display Name"] || ""),
        ].filter(Boolean));

        // Look up the barber in Data_barbers to collect both row id and user id and name
        let barberRowId: string | null = null;
        let barberUserId: string | null = null;
        let barberNameNorm: string | null = null;
        {
          const byRow = await (supabase as any)
            .from("Data_barbers")
            .select('"🔒 Row ID", "User/ID", "Barber/Name"')
            .eq("🔒 Row ID", barberId)
            .maybeSingle();
          if (!byRow.error && byRow.data) {
            barberRowId = String(byRow.data?.["🔒 Row ID"] ?? "");
            barberUserId = String(byRow.data?.["User/ID"] ?? "");
            barberNameNorm = normalize(byRow.data?.["Barber/Name"] ?? "");
          } else {
            const byUser = await (supabase as any)
              .from("Data_barbers")
              .select('"🔒 Row ID", "User/ID", "Barber/Name"')
              .eq("User/ID", barberId)
              .maybeSingle();
            if (!byUser.error && byUser.data) {
              barberRowId = String(byUser.data?.["🔒 Row ID"] ?? "");
              barberUserId = String(byUser.data?.["User/ID"] ?? "");
              barberNameNorm = normalize(byUser.data?.["Barber/Name"] ?? "");
            }
          }
        }

        // Fetch all custom rows and filter locally by service id/name and barber id/name
        const { data: allCustom, error: custErr } = await (supabase as any)
          .from("Data_Services_Custom")
          .select("*");
        if (custErr) {
          console.error("Supabase error fetching custom overrides:", custErr);
        } else if (Array.isArray(allCustom)) {
          const matches = allCustom.filter((r: any) => {
            const cIds = [
              r?.["Service/ID"], r?.["Service/Row ID"], r?.["Service Row ID"], r?.["glide_row_id"], r?.["🔒 Row ID"], r?.["ServiceId"], r?.["Service ID"],
            ].map((v: any) => (v != null ? String(v) : "")).filter(Boolean);
            const cNames = [
              r?.["Service/Name"], r?.["Service Name"], r?.["Service"], r?.["Service/Display Name"],
            ].map(normalize).filter(Boolean);
            const serviceMatch = (
              cIds.some((cid: string) => serviceIdCandidates.has(cid)) ||
              cNames.some((cn: string) => serviceNameCandidates.has(cn))
            );

            const bIds = [
              r?.["Barber/ID"], r?.["Barber Row ID"], r?.["Barber/Row ID"], r?.["Barber 🔒 Row ID"], r?.["BarberId"], r?.["Barber ID"],
            ].map((v: any) => (v != null ? String(v) : "")).filter(Boolean);
            const bNames = [r?.["Barber/Name Lookup"], r?.["Barber/Name"]].map(normalize).filter(Boolean);
            const barberMatch = (
              bIds.includes(String(barberId)) ||
              (barberRowId && bIds.includes(barberRowId)) ||
              (barberUserId && bIds.includes(barberUserId)) ||
              (barberNameNorm && bNames.includes(barberNameNorm))
            );

            return serviceMatch && barberMatch;
          });

          if (matches.length > 0) {
            const best = matches[0];
            const num = (v: any) => {
              const n = Number(v);
              return Number.isFinite(n) ? n : NaN;
            };
            const cPrice = num(best["Barber/Price"] ?? best["Custom/Price"] ?? best["Price"]);
            const cDuration = num(best["Barber/Duration"] ?? best["Custom/Duration"] ?? best["Duration"]);
            if (!Number.isNaN(cPrice)) effective.price = cPrice;
            if (!Number.isNaN(cDuration)) effective.duration = cDuration;
            effective.source = "custom";
          }
        }
      }

      return NextResponse.json({ service: base, effective });
    }

    // Otherwise, list "common" services (not barber-specific variants)
    const [svcRes, custRes] = await Promise.all([
      supabase.from("Data_Services").select("*"),
      supabase.from("Data_Services_Custom").select("Barber/Name Lookup"),
    ]);

    if (svcRes.error) {
      console.error("Supabase error fetching services:", svcRes.error);
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
    const rows = Array.isArray(svcRes.data) ? svcRes.data : [];
    const barberNameSet = buildBarberNameSet(Array.isArray(custRes.data) ? custRes.data : []);

    // Map and filter out barber-specific variants
    const mapped = rows
      .map(mapServiceRow)
      .filter((s) => !isBarberSpecificVariant(s.name, barberNameSet));

    // De-duplicate by normalized base name (keep first occurrence)
    const seen = new Set<string>();
    const commonServices = mapped.filter((s) => {
      const key = s.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by category then name
    commonServices.sort((a, b) => {
      const c = (a.category || "").localeCompare(b.category || "");
      if (c !== 0) return c;
      return (a.name || "").localeCompare(b.name || "");
    });

    // Safety fallback: if filter logic produced nothing, return mapped (unfiltered)
    if (commonServices.length === 0 && mapped.length > 0) {
      console.warn("supabaseservices: filter produced 0 results; returning unfiltered mapped list.");
      return NextResponse.json(mapped);
    }

    return NextResponse.json(commonServices);
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

