import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/server/supabase";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  } as Record<string, string>;
}

export async function OPTIONS() {
  return new NextResponse("", { headers: cors() });
}

// GET /api/fetchBookings?contactId=...
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const contactId = url.searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json(
        { error: "Missing contactId" },
        { status: 400, headers: cors() }
      );
    }

    const supabase = getSupabaseServiceClient();
    const { data, error } = await (supabase as any)
      .from("ghl_events")
      .select("*")
      .eq("contact_id", contactId)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("fetchBookings supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: cors() }
      );
    }

    return NextResponse.json({ bookings: data ?? [] }, { headers: cors() });
  } catch (e: any) {
    console.error("fetchBookings failed:", e);
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500, headers: cors() }
    );
  }
}


