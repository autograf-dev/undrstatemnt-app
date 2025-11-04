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

async function getAccessToken(): Promise<string | null> {
  try {
    const t = await getValidAccessToken();
    if (t) return t as any;
  } catch {}
  return process.env.GHL_ACCESS_TOKEN || process.env.LEADCONNECTOR_TOKEN || null;
}

export async function OPTIONS() {
  return new NextResponse("", { headers: cors() });
}

type UpdateParams = {
  appointmentId?: string;
  title?: string;
  assignedUserId?: string;
  startTime?: string;
  endTime?: string;
  calendarId?: string;
  status?: string;
  serviceName?: string;
  servicePrice?: string | number;
  serviceDuration?: string | number;
  staffName?: string;
  customerFirstName?: string;
  customerLastName?: string;
};

async function doUpdate(params: UpdateParams) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Access token missing" }, { status: 401, headers: cors() });
  }

  const appointmentId = params.appointmentId;
  if (!appointmentId) {
    return NextResponse.json({ error: "Missing required parameter: appointmentId" }, { status: 400, headers: cors() });
  }

  // Build payload from provided fields
  const payload: Record<string, any> = {};
  if (params.title) payload.title = params.title;
  if (params.assignedUserId) payload.assignedUserId = params.assignedUserId;
  if (params.startTime) payload.startTime = params.startTime;
  if (params.endTime) payload.endTime = params.endTime;
  if (params.calendarId) payload.calendarId = params.calendarId;
  if (params.status) payload.appointmentStatus = params.status;

  // Prefetch current appointment for missing basics
  try {
    const pre = await fetch(
      `https://services.leadconnectorhq.com/calendars/events/appointments/${encodeURIComponent(appointmentId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Version: "2021-04-15",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    const current = await pre.json().catch(() => ({}));
    if (!payload.calendarId && current?.calendarId) payload.calendarId = current.calendarId;
    if (!payload.assignedUserId && current?.assignedUserId) payload.assignedUserId = current.assignedUserId;
    if (!payload.title && current?.title) payload.title = current.title;
    if (!payload.address && current?.address) payload.address = current.address;
    if (!payload.locationId && current?.locationId) payload.locationId = current.locationId;
    if (!payload.meetingLocationType && current?.meetingLocationType) payload.meetingLocationType = current.meetingLocationType;
    if (!payload.meetingLocationId && current?.meetingLocationId) payload.meetingLocationId = current.meetingLocationId;
  } catch (e) {
    console.warn("Prefetch failed", e);
  }

  // Relax validations when moving time
  if (payload.startTime || payload.endTime) {
    payload.ignoreFreeSlotValidation = true;
    payload.ignoreDateRange = true;
    payload.toNotify = true;
  }

  // LeadConnector update
  let updatedBooking: any = null;
  try {
    const resp = await fetch(
      `https://services.leadconnectorhq.com/calendars/events/appointments/${encodeURIComponent(appointmentId)}`,
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
    updatedBooking = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: updatedBooking }, { status: resp.status || 500, headers: cors() });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "LeadConnector update failed" }, { status: 500, headers: cors() });
  }

  // Ensure start/end reflected in object even if API omits them
  if (params.startTime) updatedBooking.startTime = params.startTime;
  if (params.endTime) updatedBooking.endTime = params.endTime;

  // Prepare enhanced data for DB
  const customerName = `${params.customerFirstName || ""} ${params.customerLastName || ""}`.trim() || null;
  const enhancedData = {
    serviceName: params.serviceName || null,
    servicePrice: params.servicePrice != null ? Number(params.servicePrice) : null,
    serviceDuration: params.serviceDuration != null ? Number(params.serviceDuration) : null,
    staffName: params.staffName || null,
    customerName,
  } as Record<string, any>;

  // Update Supabase record in ghl_events
  try {
    const supabase = getSupabaseServiceClient();
    const { data: existing, error: readErr } = await (supabase as any)
      .from("ghl_events")
      .select("*")
      .eq("id", appointmentId)
      .maybeSingle();
    if (readErr) console.error("Supabase read error:", readErr);

    const raw = { ...(existing?.raw ?? {}) } as Record<string, any>;
    if (enhancedData.serviceName != null) raw.serviceName = enhancedData.serviceName;
    if (enhancedData.servicePrice != null) raw.servicePrice = enhancedData.servicePrice;
    if (enhancedData.serviceDuration != null) raw.serviceDuration = enhancedData.serviceDuration;
    if (enhancedData.staffName != null) raw.staffName = enhancedData.staffName;
    if (enhancedData.customerName != null) raw.customerName = enhancedData.customerName;
    if (params.status) {
      raw.appointmentStatus = params.status;
      raw.appoinmentStatus = params.status;
      raw.status = params.status;
    }
    if (params.startTime) raw.startTime = params.startTime;
    if (params.endTime) raw.endTime = params.endTime;

    const updateFields: Record<string, any> = {
      updated_at: new Date().toISOString(),
      raw,
    };
    if (params.calendarId) updateFields.calendar_id = params.calendarId;
    if (params.assignedUserId) updateFields.assigned_user_id = params.assignedUserId;
    if (params.status) updateFields.appointment_status = params.status;
    if (params.startTime) updateFields.start_time = params.startTime;
    if (params.endTime) updateFields.end_time = params.endTime;

    const { data: dbUpdated, error: updErr } = await (supabase as any)
      .from("ghl_events")
      .update(updateFields)
      .eq("id", appointmentId)
      .select("*")
      .maybeSingle();
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500, headers: cors() });
    }

    return NextResponse.json({ message: "Updated", response: updatedBooking, dbUpdate: dbUpdated }, { headers: cors() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "DB update failed" }, { status: 500, headers: cors() });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p: UpdateParams = Object.fromEntries(url.searchParams.entries()) as any;
  return doUpdate(p);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return doUpdate(body as UpdateParams);
}


