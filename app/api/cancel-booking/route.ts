import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/server/supabase";
import { getValidAccessToken } from "@/lib/server/tokens";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  } as Record<string, string>;
}

export async function OPTIONS() {
  return new NextResponse("", { headers: cors() });
}

async function getAccessToken(): Promise<string | null> {
  try {
    const t = await getValidAccessToken();
    if (t) return t as any;
  } catch {}
  return process.env.GHL_ACCESS_TOKEN || process.env.LEADCONNECTOR_TOKEN || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const bookingId = body?.bookingId || body?.appointmentId || null;
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400, headers: cors() });
    }

    // Best-effort cancel in LeadConnector
    const token = await getAccessToken();
    let lc: any = null;
    if (token) {
      try {
        const payload = { appointmentStatus: "cancelled" } as any;
        const resp = await fetch(
          `https://services.leadconnectorhq.com/calendars/events/appointments/${encodeURIComponent(bookingId)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              Version: "2021-04-15",
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        lc = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          console.error("LeadConnector cancel failed", lc);
        }
      } catch (e) {
        console.error("LeadConnector request error", e);
      }
    }

    // Update Supabase table row to cancelled
    const supabase = getSupabaseServiceClient();
    // Attempt to update both a top-level column and the JSON raw.appoinmentStatus if present
    // Read existing row to update JSON payload too
    const { data: existing, error: readErr } = await (supabase as any)
      .from("ghl_events")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();
    if (readErr) {
      console.error("Supabase read error:", readErr);
    }
    const nowIso = new Date().toISOString();
    const currentRaw = (existing?.raw ?? {}) as Record<string, any>;
    const newRaw = {
      ...currentRaw,
      // normalize a few commonly used keys
      appoinmentStatus: "cancelled", // existing misspelling used in data
      appointmentStatus: "cancelled",
      status: "cancelled",
    };

    const { data, error } = await (supabase as any)
      .from("ghl_events")
      .update({
        appointment_status: "cancelled",
        raw: newRaw,
        updated_at: nowIso,
      })
      .eq("id", bookingId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: cors() });
    }

    return NextResponse.json(
      { message: "Cancelled", response: lc, updated: data },
      { headers: cors() }
    );
  } catch (e: any) {
    console.error("cancel-booking failed", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500, headers: cors() });
  }
}


