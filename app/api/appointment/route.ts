import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/server/tokens';
import { saveEventToDB } from '@/lib/server/appointments';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function pick(obj: URLSearchParams | Record<string, any>, ...keys: string[]) {
  for (const k of keys) {
    const v = obj instanceof URLSearchParams ? obj.get(k) : obj[k];
    if (v !== undefined && v !== null && String(v).length > 0) return v as string;
  }
  return undefined;
}

async function createAppointment(params: Record<string, any>) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('Access token missing');

  const payload: any = {
    title: params.title || 'Booking from website',
    meetingLocationType: 'custom',
    meetingLocationId: 'custom_0',
    overrideLocationConfig: true,
    appointmentStatus: 'confirmed',
    address: 'Zoom',
    ignoreDateRange: true,
    toNotify: true,
    ignoreFreeSlotValidation: true,
    calendarId: params.calendarId,
    locationId: process.env.GHL_LOCATION_ID || 'iwqzlJBNFlXynsezheHv',
    contactId: params.contactId,
    startTime: params.startTime,
    endTime: params.endTime,
  };
  if (params.assignedUserId) payload.assignedUserId = params.assignedUserId;

  const resp = await fetch('https://services.leadconnectorhq.com/calendars/events/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, Version: '2021-04-15', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`Booking failed: ${resp.status} ${msg}`);
  }
  const data = await resp.json();
  return data;
}

export async function OPTIONS() { return new NextResponse('', { headers: cors() }); }

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params: Record<string, any> = {};

    const p = (k: string) => url.searchParams.get(k) || undefined;
    const picker = (...keys: string[]) => keys.map((k) => url.searchParams.get(k)).find((v) => v !== null && v !== '') || undefined;

    params.contactId = picker('contactId', 'contact_id');
    params.calendarId = picker('calendarId', 'calendar_id');
    params.assignedUserId = picker('assignedUserId', 'assigned_user_id');
    params.startTime = picker('startTime', 'start_time');
    params.endTime = picker('endTime', 'end_time');
    params.title = p('title') || 'Booking from website';
    params.serviceName = picker('serviceName', 'service_name');
    params.serviceDuration = picker('serviceDuration', 'booking_duration');
    params.servicePrice = picker('servicePrice', 'booking_price');
    params.staffName = picker('staffName', 'assigned_barber_name');
    params.paymentStatus = picker('paymentStatus', 'payment_status');
    params.customerName = picker('customerName', 'customer_name');
    params.customerFirstName = picker('customerFirstName', 'first_name');
    params.customerLastName = picker('customerLastName', 'last_name');

    if (!params.contactId || !params.calendarId || !params.startTime || !params.endTime) {
      return NextResponse.json({ error: 'Missing required parameters: contactId, calendarId, startTime, endTime' }, { status: 400, headers: cors() });
    }

    const booking = await createAppointment(params);

    // Enrich and save to DB
    const enhanced = {
      serviceName: params.serviceName,
      serviceDuration: params.serviceDuration ? Number(params.serviceDuration) : undefined,
      servicePrice: params.servicePrice ? Number(params.servicePrice) : undefined,
      staffName: params.staffName,
      paymentStatus: params.paymentStatus,
      customerName: params.customerName || [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') || undefined,
      startTime: params.startTime,
      endTime: params.endTime,
      assignedUserId: params.assignedUserId,
      apptId: booking?.id,
    };

    try { await saveEventToDB({ ...booking, ...enhanced }); } catch (e) { console.error('DB save failed:', (e as Error).message); }

    return NextResponse.json({ message: '✅ Booking success', response: booking }, { headers: cors() });
  } catch (err: any) {
    console.error('❌ Booking failed:', err?.message || err);
    return NextResponse.json({ error: 'Booking failed', details: err?.message || 'Unknown' }, { status: 500, headers: cors() });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const params = body || {};
    if (!params.contactId || !params.calendarId || !params.startTime || !params.endTime) {
      return NextResponse.json({ error: 'Missing required parameters: contactId, calendarId, startTime, endTime' }, { status: 400, headers: cors() });
    }
    const booking = await createAppointment(params);
    try { await saveEventToDB(booking); } catch (e) { console.error('DB save failed:', (e as Error).message); }
    return NextResponse.json({ message: '✅ Booking success', response: booking }, { headers: cors() });
  } catch (err: any) {
    console.error('❌ Booking failed:', err?.message || err);
    return NextResponse.json({ error: 'Booking failed', details: err?.message || 'Unknown' }, { status: 500, headers: cors() });
  }
}
